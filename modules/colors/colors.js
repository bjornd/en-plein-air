YUI.add('colors', function (Y) {
  Y.Colors = {
    getImagePalette: function(canvas){
      var result = kMeans(getContextColors(canvas.getContext('2d')), 6);

      result.centroids.sort(function(a, b){
        var av = a[0]*256*256 + a[1]*256 + a[2],
            bv = b[0]*256*256 + b[1]*256 + b[2]

        return bv - av;
      });

      return result.centroids;
    }
  };

  function getContextColors(ctx) {
    var data = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height).data,
        colors = [];

    for (i = 0; i < data.length; i+=4) {
      colors.push([data[i], data[i+1], data[i+2]]);
    }
    return colors;
  };

  function getDistance(c1, c2) {
    var i,
        d = 0;

    for (i = 0; i < c1.length; i++) {
      d += (c2[i] - c1[i])*(c2[i] - c1[i]);
    }
    return Math.sqrt(d);
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
      initial.push(data[Math.floor(Math.random()*data.length)]);
    }
    return initial;
  };

  function kMeans(data, k) {
    var centroids = getInitialData(data, k),
        clusterAssment = [],
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
    return {centroids: centroids, clusters: clusterAssment};
  };
});