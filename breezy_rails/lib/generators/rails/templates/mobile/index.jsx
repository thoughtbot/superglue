import React from 'react'
import {mapDispatchToProps, mapStateToProps} from '@jho406/breezy'
import {connect} from 'react-redux'
import {View, Text, TouchableOpacity, Alert} from 'react-native'
import {Header, Card} from 'react-native-elements'
import DropdownAlert from 'react-native-dropdownalert';
import {Container, IconDelete, IconEdit, IconShow, BarNew} from 'components/elements'

class <%= plural_table_name.camelize %>Index extends React.Component {
  static defaultProps = {
    <%= plural_table_name %>: []
  }

  constructor (props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
    this.handleDeleteClick = this.handleDeleteClick.bind(this)
  }

  handleDeleteClick(path) {
    const method = 'DELETE'

    Alert.alert(
      'Wait!',
      'Are you sure you want to delete this <%=singular_table_name%>?',
      [
        {
          text: 'Delete',
          onPress: e => {this.props.visit(path, {method})},
          style: 'destructive'
         },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: false }
    )
  }

  handleClick(path, method='GET') {
    const nav = this.props.navigation
    this.props.visit(path, {method}).then((rsp)=>{
      if (rsp.canNavigate) {
        return nav.navigate(rsp.screen, {pageKey: rsp.pageKey})
      } else {
        // There can only be one visit at a time, if `canNavigate`
        // is false, then this request is being ignored for a more
        // recent visit. Do Nothing.
        return
      }
    })
  }

  showNotice (message) {
    if (message) {
      setImmediate(() => {
        this.dropdown.alertWithType('success', 'Success', message);
      })

      return <DropdownAlert ref={ref => this.dropdown = ref} translucent={true}/>
   } else {
      return null
   }
  }

  render () {
    const headerOptions = {
      centerComponent: { text: 'POSTS', style: { color: '#fff' } },
      rightComponent: (<BarNew
        onPress={e => this.handleClick('/<%=plural_table_name%>/new')}
      />)
    }

    return (
      <View>
        <Header {...headerOptions}/>
        <Container>
          {this.props.<%=plural_table_name%>.map((<%=singular_table_name%>) => {
            const {show_path, edit_path, delete_path} = <%=singular_table_name%>.meta
            return (
              <Card key={<%=singular_table_name%>.id}>
                <TouchableOpacity>
                  <% attributes_list.select{|attr| attr != :id }.each do |attr| %><Text style={{marginBottom: 10}}>{<%=singular_table_name%>.<%=attr%>}</Text>
<% end %>
                </TouchableOpacity>
                <View style={{flex: 1, justifyContent: 'flex-end', flexDirection: 'row'}}>
                  <IconDelete onPress={e => this.handleDeleteClick(delete_path)}/>
                  <IconEdit onPress={e => this.handleClick(edit_path)}/>
                  <IconShow onPress={e => this.handleClick(show_path)}/>
                </View>
              </Card>
            )
        })}
        </Container>
      {this.showNotice(this.props.notice)}
      </View>
    )
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(<%= plural_table_name.camelize %>Index)

