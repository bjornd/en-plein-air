YUI({
  filter: 'raw'
}).use('app', 'template-view', 'create-view', 'button-group', function (Y) {
  var app;

  app = new Y.App({
    views: {
      create: {type: 'CreateView'},
      history: {type: 'TemplateView'},
      palettes: {type: 'TemplateView'},
      palette: {parent: 'palettes', type: 'TemplateView'}
    },
    container: '#app-content',
    serverRouting: false
  });

  app.route('/:name', function (req) {
    var name = req.params.name;

    this.showView(name, {name: name});
  });

  app.render().navigate('/create');


  var buttonGroupRadio = new Y.ButtonGroup({
    srcNode: '#app-menu-buttons',
    type: 'radio'
  })

  buttonGroupRadio.render();

  buttonGroupRadio.on('selectionChange', function(e){
      app.navigate('/'+this.getSelectedButtons()[0].getData('route'));
  });
});