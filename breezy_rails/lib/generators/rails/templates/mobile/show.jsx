import React from 'react'
import {mapStateToProps, mapDispatchToProps} from '@jho406/breezy'
import {connect} from 'react-redux'
import {Text, View} from 'react-native'
import {Header, Card} from 'react-native-elements'
import {Container, BarGoBack} from 'components/elements'

class <%= plural_table_name.camelize %>Show extends React.Component {
  render() {
    const headerOptions = {
      leftComponent: (<BarGoBack onPress={ e => this.props.navigation.goBack()} />)
    }

    return (
      <View>
        <Header {...headerOptions}/>
        <Container>
          <Card><% attributes_list_with_timestamps.select{|attr| attr != :id }.each do |attr| %>
            <Text style={{fontWeight: 'bold'}}><%=attr%></Text>
            <Text>{this.props.<%=attr%>}</Text><% end %>
          </Card>
        </Container>
      </View>
    )
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(<%= plural_table_name.camelize %>Show)

