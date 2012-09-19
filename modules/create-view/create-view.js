YUI.add('create-view', function (Y) {
  Y.CreateView = Y.Base.create('CreateView', Y.View, [], {
    render: function () {
      var template = Y.Handlebars.compile( Y.one('#tpl-create-view').getHTML() ),
          paletteTemplate = Y.Handlebars.compile( Y.one('#tpl-palette').getHTML() ),
          container = this.get('container'),
          cameraDialog = new Y.CameraDialog();

      container.setHTML(template());

      container.one('.app-create-view-show-camera').on('click', function(){
        cameraDialog.show(function(canvas){
          container.one('.app-create-view-palette').setHTML(paletteTemplate({
            image: {
              url: canvas.toDataURL()
            },
            colors: Y.Colors.getImagePalette(canvas)
          }));
        });
      });

      container.one('.app-create-view-create-from-url').on('click', function(){
        var url = container.one('.app-create-view-url').get('value'),
            image = Y.Node.create('<img/>'),
            canvas = Y.Node.create('<canvas></canvas>').getDOMNode(),
            ctx = canvas.getContext('2d');

        image.on('load', function(){
          var width = image.get('width'),
              height = image.get('height');

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(image.getDOMNode(), 0, 0, width, height);
          container.one('.app-create-view-palette').setHTML(paletteTemplate({
            image: {
              url: canvas.toDataURL()
            },
            colors: Y.Colors.getImagePalette(canvas)
          }));
        })
        image.on('error', function(){
          console.log('image failed to load');
        });
        image.set('src', url);
      });

      return this;
    }
  });
}, '0.0.1', {
  requires: ['view', 'handlebars', 'camera-dialog', 'colors']
});