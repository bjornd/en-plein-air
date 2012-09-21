YUI.add('camera-dialog', function (Y) {
  Y.CameraDialog = function(config){
    config = Y.merge(config || {}, {
      bodyContent: '<video autoplay width="400" height="300"></video>',
      headerContent: 'Make a shot',
      zIndex: 6,
      centered: true,
      modal: true,
      render: true,
      visible: false,
      buttons: {
        footer: [{
          name  : 'cancel',
          label : 'Cancel',
          action: 'onCancel'
        }, {
          name     : 'proceed',
          label    : 'OK',
          action   : 'onOK'
        }]
      }
    });

    this.callback = config.callback;

    Y.CameraDialog.superclass.constructor.apply(this, [config]);

    this.videoElement = this.get('boundingBox').one('video');
  };

  Y.CameraDialog.NAME = 'panel';

  Y.extend(Y.CameraDialog, Y.Panel);

  Y.CameraDialog.prototype.show = function(callback) {
    this.callback = callback;
    if (!this.userMediaReady) {
      this.getUserMedia();
    }
    Y.CameraDialog.superclass.show.call(this);
  };

  Y.CameraDialog.prototype.getUserMedia = function() {
    var that = this;

    navigator.webkitGetUserMedia({video: true}, function(localMediaStream) {
      that.userMediaReady = true;
      that.videoElement.set('src', window.webkitURL.createObjectURL(localMediaStream));
    }, function(e) {
      console.log('getUserMedia rejected', e);
    });
  };

  Y.CameraDialog.prototype.onOK = function(e) {
    var canvas = Y.Node.create('<canvas></canvas>').getDOMNode();

    canvas.width = 400;
    canvas.height = 300;
    canvas.getContext('2d').drawImage(this.videoElement.getDOMNode(), 0, 0, 400, 300)

    e.preventDefault();
    this.hide();
    if (this.callback){
       this.callback( canvas );
    }
    this.callback = false;
  };

  Y.CameraDialog.prototype.onCancel = function(e) {
    e.preventDefault();
    this.hide();
    this.callback = false;
  };
}, '0.0.1', {
  requires: ['view', 'handlebars', 'panel']
});