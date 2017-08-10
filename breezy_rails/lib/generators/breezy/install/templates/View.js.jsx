App.Components.View = React.createClass({
  render: function() {
    var view = App.Views[this.props.view].call(this, this.props.data);
    var layout = App.Layouts[this.props.layout || 'Default'];
    return layout(view);
  }
});
