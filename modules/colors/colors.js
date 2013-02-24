YUI.add('colors', function (Y) {
  Y.Colors = {
    getImagePalette: function(sourceCanvas, maxArea){
      var canvas;

      maxArea = maxArea || 1e3;

      if (sourceCanvas.width * sourceCanvas.height > maxArea) {
        canvas = Y.Node.create('<canvas></canvas>').getDOMNode();
        canvas.width = Math.sqrt(maxArea * sourceCanvas.width / sourceCanvas.height);
        canvas.height = sourceCanvas.height / sourceCanvas.width * canvas.width;
        canvas.getContext('2d').drawImage(sourceCanvas, 0, 0, canvas.width, canvas.height);
      } else {
        canvas = sourceCanvas;
      }

      console.time('bikMeans');
      var result = biKMeans(getContextColors(canvas.getContext('2d')), 8, true);
      console.timeEnd('bikMeans');

      result.centroids.sort(function(a, b){
        var av = a[0]*256*256 + a[1]*256 + a[2],
            bv = b[0]*256*256 + b[1]*256 + b[2]

        return bv - av;
      });

      return result.centroids;
    },

    getColorBrightness: function(c){
        return Math.sqrt(
          c[0] * c[0] * .241 +
          c[1] * c[1] * .691 +
          c[2] * c[2] * .068
        );
    }
  };

  function getContextColors(ctx) {
    var data = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height).data,
        colors = [];

    for (i = 0; i < data.length; i+=4 ) {
      colors.push([data[i], data[i+1], data[i+2]]);
    }
    return colors;
  };

  //http://www.compuphase.com/cmetric.htm
  function getDistance(c1, c2) {
    var i,
        d = 0,
        rmean = (c1[0] + c2[0]) / 2,
        r = c1[0] - c2[0],
        g = c1[1] - c2[1],
        b = c1[2] - c2[2];

    return Math.sqrt( (((512+rmean)*r*r)>>8) + 4*g*g + (((767-rmean)*b*b)>>8) );
  };

  function getMean(data) {
    var mean = [],
        i,
        j;

    for (i = 0; i < data[0].length; i++) {
      mean[i] = 0;
    }
    for (i = 0; i < data.length; i++) {
      for (j = 0; j < data[i].length; j++) {
        mean[j] += data[i][j];
      }
    }
    for (i = 0; i < data[0].length; i++) {
      mean[i] = Math.floor(mean[i] / data.length);
    }
    return mean;
  };

  function getInitialData(data, k) {
    var initial = [],
        i;

    for (i = 0; i < k; i++) {
      initial.push(data[Math.round(data.length / 2 * i)]);
    }
    return initial;
  };

  function getSum(a){
    var i,
        sum = 0;

    for (i = 0; i < a.length; i++) {
      sum += a[i];
    }
    return sum;
  };

  function biKMeans(data, k, findBest) {
    var clusterAssment = [],
        i,
        j,
        centroids = [],
        sseLowest,
        pointsInCluster,
        pointsNotInCluster,
        kMeansResult,
        sseSplit,
        sseNotSplit,
        errors = [],
        bestCentToSplit,
        bestNewCents,
        bestClustAss,
        bestErrors,
        centroidsDist,
        minCentroidsDist = Number.POSITIVE_INFINITY,
        metric,
        bestMetric = Number.POSITIVE_INFINITY,
        bestMetricData;

    centroids[0] = getMean(data);
    for (i = 0; i < data.length; i++) {
      clusterAssment[i] = 0;
      errors[i] = getDistance(centroids[0], data[i]);
    }
    while (centroids.length < k) {
      sseLowest = Number.POSITIVE_INFINITY;
      for (i = 0; i < centroids.length; i++) {
        pointsInCluster = [];
        pointsNotInCluster = [];
        for (j = 0; j < clusterAssment.length; j++) {
          if (clusterAssment[j] === i) {
            pointsInCluster.push(data[j]);
          }
        }
        kMeansResult = kMeans(pointsInCluster, 2);
        sseSplit = getSum(kMeansResult.errors);
        sseNotSplit = 0;
        for (j = 0; j < clusterAssment.length; j++) {
          if (clusterAssment[j] != i) {
            sseNotSplit += errors[j];
          }
        }
        if (sseSplit + sseNotSplit < sseLowest) {
          bestCentToSplit = i;
          bestNewCents = kMeansResult.centroids;
          bestClustAss = kMeansResult.clusters;
          bestErrors = kMeansResult.errors;
          sseLowest = sseSplit + sseNotSplit;
        }
      }
      for (i = 0, j = 0; i < clusterAssment.length; i++) {
        if (clusterAssment[i] == bestCentToSplit) {
          clusterAssment[i] = bestClustAss[j] == 0 ? bestCentToSplit : centroids.length;
          errors[i] = bestErrors[j];
          j++;
        }
      }
      centroids[bestCentToSplit] = bestNewCents[0];
      centroids.push(bestNewCents[1]);

      if (findBest) {
        for (i = 0; i < centroids.length; i++) {
          for (j = 0; j < centroids.length; j++) {
            if (i != j) {
              centroidsDist = getDistance(centroids[i], centroids[j]);
              if (centroidsDist < minCentroidsDist) {
                minCentroidsDist = centroidsDist;
              }
            }
          }
        }
        metric = (getSum(errors) / errors.length) / minCentroidsDist;
        if (metric < bestMetric) {
          bestMetric = metric;
          bestMetricData = {centroids: centroids.slice(), clusters: clusterAssment.slice(), errors: errors.slice()};
        }
      }
    }
    if (findBest) {
      return bestMetricData;
    } else {
      return {centroids: centroids, clusters: clusterAssment, errors: errors};
    }
  };

  function kMeans(data, k) {
    var centroids = getInitialData(data, k),
        clusterAssment = [],
        errors = [],
        clusterChanged,
        i,
        j,
        minDist,
        minIndex,
        dist,
        pointsInCluster;

    do {
      clusterChanged = false;
      for (i = 0; i < data.length; i++) {
        minDist = Number.POSITIVE_INFINITY;
        minIndex = -1;
        for (j = 0; j < k; j++) {
          dist = getDistance(centroids[j], data[i]);
          if (dist < minDist) {
            minDist = dist;
            minIndex = j;
          }
        }
        if (clusterAssment[i] != minIndex) {
          clusterChanged = true;
        }
        clusterAssment[i] = minIndex;
        errors[i] = minDist*minDist;
      }
      for (i = 0; i < k; i++) {
        pointsInCluster = [];
        for (j = 0; j < clusterAssment.length; j++) {
          if (clusterAssment[j] === i) {
            pointsInCluster.push(data[j]);
          }
        }
        if (pointsInCluster.length > 0) {
          centroids[i] = getMean(pointsInCluster);
        }
      }
    } while (clusterChanged);
    return {centroids: centroids, clusters: clusterAssment, errors: errors};
  };
});