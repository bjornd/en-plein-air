YUI.add('image-url-dialog', function (Y) {
  Y.ImageUrlDialog = function(config){
    config = Y.merge(config || {}, {
      bodyContent: '<input class="app-create-view-image-url-input"/>',
      headerContent: 'Enter image URL',
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

    Y.ImageUrlDialog.superclass.constructor.apply(this, [config]);

    this.inputElement = this.get('boundingBox').one('input');
  };

  Y.ImageUrlDialog.NAME = 'panel';

  Y.extend(Y.ImageUrlDialog, Y.Panel);

  Y.ImageUrlDialog.prototype.show = function(callback) {
    this.callback = callback;
    Y.ImageUrlDialog.superclass.show.call(this);
  };

  Y.ImageUrlDialog.prototype.onOK = function(e) {
    e.preventDefault();
    this.hide();
    if (this.callback){
       this.callback( this.inputElement.get('value') );
    }
    this.callback = false;
  };

  Y.ImageUrlDialog.prototype.onCancel = function(e) {
    e.preventDefault();
    this.hide();
    this.callback = false;
  };
}, '0.0.1', {
  requires: ['view', 'handlebars', 'panel']
});