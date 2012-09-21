YUI.add('create-view', function (Y) {
  Y.CreateView = Y.Base.create('CreateView', Y.View, [], {
    maxImageWidth: 400,
    maxImageHeight: 400,

    render: function () {
      var template = Y.Handlebars.compile( Y.one('#tpl-create-view').getHTML() ),
          container = this.get('container'),
          cameraDialog = new Y.CameraDialog(),
          that = this;

      this.paletteTemplate = Y.Handlebars.compile( Y.one('#tpl-palette').getHTML() );

      container.setHTML(template());

      container.one('.app-create-view-show-camera').on('click', function(){
        cameraDialog.show(function(canvas){
          that.createPaletteFromCanvas(canvas);
        });
      });

      container.one('.app-create-view-file-input').on('change', function(){
        var file = this.getDOMNode().files[0];

        that.createPaletteFromImageUrl( window.webkitURL.createObjectURL(file) );
      });

      container.one('.app-create-view-create-from-url').on('click', function(){
        that.createPaletteFromImageUrl( container.one('.app-create-view-url').get('value') );
      });

      return this;
    },

    setImage: function(url){
      this.paletteImageUrl = url;
      this.renderPalette();
    },

    setPalette: function(palette){
      this.paletteColors = palette;
      this.renderPalette();
    },

    renderPalette: function(){
      this.get('container').one('.app-create-view-palette').setHTML(this.paletteTemplate({
        image: {
          url: this.paletteImageUrl || ''
        },
        colors: this.paletteColors || []
      }));
    },

    createPaletteFromCanvas: function(canvas){
      this.setImage(canvas.toDataURL());
      this.setPalette(Y.Colors.getImagePalette(canvas));
    },

    createPaletteFromImageUrl: function(imageUrl){
      var image = Y.Node.create('<img/>'),
          canvas = Y.Node.create('<canvas></canvas>').getDOMNode(),
          ctx = canvas.getContext('2d'),
          that = this;

      image.on('load', function(){
        var width = image.get('width'),
            height = image.get('height');

        if (width > that.maxImageWidth || height > that.maxImageHeight) {
          if (width / height > that.maxImageWidth / that.maxImageHeight) {
            height = height * that.macImageWidth / width;
            width = that.maxImageWidth;
          } else {
            width = width * that.maxImageHeight / height;
            height = that.maxImageHeight;
          }
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(image.getDOMNode(), 0, 0, width, height);
        that.createPaletteFromCanvas(canvas);
      });
      image.on('error', function(){
        console.log('image failed to load');
      });
      image.set('src', imageUrl);
    }
  });
}, '0.0.1', {
  requires: ['view', 'handlebars', 'camera-dialog', 'colors']
});