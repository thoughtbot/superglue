import React from 'react'
import {submit} from 'redux-form'
import {Header} from 'react-native-elements'
import {SubmissionError} from 'redux-form'
import {View} from 'react-native'
import {connect} from 'react-redux'
import {delInPage} from '@jho406/breezy/dist/action_creators'
import {mapStateToProps, mapDispatchToProps} from '@jho406/breezy'
import <%= plural_table_name.camelize %>Form from 'components/<%= plural_table_name.camelize %>Form'
import {Container, BarSaveAndGoBack, BarCancel} from 'components/elements'

class <%= plural_table_name.camelize %>Edit extends React.Component {
  constructor (props) {
    super(props)
    this.submit = this.submit.bind(this)
    this.remoteSubmit = this.remoteSubmit.bind(this)
  }

  submit (body) {
    const options = {
      method: 'PATCH',
      body: JSON.stringify(body),
      contentType: 'application/json'
    }

    this.props.delInPage({pageKey: this.props.pageKey, keypath: 'errors'})
    return this.props.visit('/<%= plural_table_name %>/' + this.props.id, options).then((rsp) => {
      if (this.props.errors) {
        throw new SubmissionError({
          ...this.props.errors
        })
      }
      if (rsp.canNavigate) {
        return this.props.navigation.goBack()
      } else {
        // There can only ve one visit at a time, if `canNavigate`
        // is false, then this request is being ignored for a more
        // recent visit. Do Nothing.
        return
      }

    }).catch((err) => {
      if (err instanceof SubmissionError) {
        throw err
      } else {
        //handle other errors here
      }
    })
  }

  remoteSubmit () {
    this.props.remoteSubmit('<%=plural_table_name%>_form')
  }

  render () {
    const headerOptions = {
      leftComponent: (<BarSaveAndGoBack onPress={this.remoteSubmit} />),
      rightComponent: (<BarCancel onPress={e => this.props.navigation.goBack()} />)
    }
    return (
      <View>
        <Header {...headerOptions}/>
        <Container>
          <<%= plural_table_name.camelize %>Form error={this.props.error} onSubmit={this.submit} initialValues={this.props.attributes_for_form}/>
        </Container>
      </View>
    )
  }
}

export default connect(
  mapStateToProps,
  {...mapDispatchToProps, remoteSubmit: submit, delInPage}
)(<%= plural_table_name.camelize %>Edit)


