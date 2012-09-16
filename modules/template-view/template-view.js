YUI.add('template-view', function (Y) {
  Y.TemplateView = Y.Base.create('TemplateView', Y.View, [], {
    render: function () {
      var name = this.get('name');
      this.get('container').set('text', 'Hello ' + (name || 'World') + '!');
      return this;
    }
  });
}, '0.0.1', {
  requires: ['view']
});

