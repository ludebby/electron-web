import React from 'react'

import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import 'bootstrap/dist/css/bootstrap.min.css'

const rowStyle = { padding: '5px', backgroundColor: '#D6DBDF' }

export default class Main extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      username: '',
      description: ''
    }

    // ------MessagePorts機制--------------- //
    // preload.js會發送port1過來,在此處進行port1接收動作
    window.onmessage = (e) => {
      if (e.ports[0]) {
        console.log(e.data)
        // console.log(e)
        const messagePort = e.ports[0]
        // port1.start()
        // prot1 receive message from port2
        messagePort.onmessage = function (event) {
          console.log('[MessagePorts][tab2][port1 get message from port2]:', event.data)
        }

        this.messagePort = messagePort

        console.log('[MessagePorts][tab2]init ok,have MessageChannel port1')
      }
    }

    // ------------------------- //

    if (window.api) {
      // electron ipc
      // console.log('onReceive')
      // 接收來自main process的訊息或回應
      window.api.onTabActive((data) => {
        console.log('tab-active')
        this.getSharedState()
      })
      window.api.onReceive('main-to-web-send-channel', (data) => {
        console.log(`[main-to-web-send-channel]Received ${data} from main process`)
      })

      window.api.onReceive('web-to-main-send-channel', (data) => {
        console.log(`[web-to-main-send-channel]Received ${data} from main process`)
      })
    }

    // ------websocket機制----------------------- //
    const websocket = new WebSocket('ws://localhost:3000')

    this.websocket = websocket

    // 當連線建立時
    websocket.onopen = () => {
      console.log('[WebSocket]已連線到 WebSocket 伺服器')
    }

    // 接收伺服器訊息
    websocket.onmessage = (event) => {
      console.log(`[WebSocket]Received: ${event.data} from main process`)
    }
    // ------------------------- //
  }

  componentDidMount () {
  }

  // ----- 傳送訊息給main process ----- //

  postMessage = (data) => {
    // MessagePorts機制
    // port1 postMessage to port2
    console.log('postMessage')
    this.messagePort.postMessage(data)
  }

  // ----- 傳送訊息給main process ----- //

  send = () => {
    console.log('send')
    window.api.send('web-to-main-send-channel', { msg: 'web-to-main-send-msg', targetTime: '0' })
  }

  sendMock5 = () => {
    console.log('send')
    window.api.send('web-to-main-send-channel', { msg: 'web-to-main-send-msg', targetTime: '5000' })
  }

  sendSync = () => {
    console.log('sendSync')
    console.log(window.api.sendSync('web-to-main-sendSync-channel', { msg: 'web-to-main-sendSync-msg', targetTime: '0' }))
  }

  sendSyncMock5 = () => {
    console.log('sendSync')
    console.log(window.api.sendSync('web-to-main-sendSync-channel', { msg: 'web-to-main-sendSync-msg', targetTime: '5000' }))
  }

  invoke = () => {
    console.log('invoke')
    window.api.invoke('web-to-main-invoke-channel', { msg: 'web-to-main-invoke-msg', targetTime: '0' }).then(msg => console.log(msg))
  }

  invokeMock5 = () => {
    console.log('invoke')
    window.api.invoke('web-to-main-invoke-channel', { msg: 'web-to-main-invoke-msg', targetTime: '5000' }).then(msg => console.log(msg))
  }

  /*
  以上測試web與main的各種底層傳遞訊息方式
  實務上不會直接使用以上方式
  而採用如下方callHttpService等方法,用invoke,並封裝channel name,讓web端程式可以簡單呼叫
  */

  getSharedState = () => {
    console.log('getSharedState')
    window.api.getSharedState().then(data => {
      this.setState(data)
    })
  }

  // ----- 透過main process呼叫http服務 ----- //

  callHttpService = () => {
    console.log('callHttpService')
    window.api.callHttpService({ param: '1' }).then(msg => console.log(msg))
  }

  /*
  直接呼叫http服務
  需搭配index.html中Content-Security-Policy設定
  */
  callHttpServiceDirect = () => {
    console.log('callHttpServiceDirect')
    fetch('https://jsonplaceholder.typicode.com/todos/1')
      .then(response => response.json())
      .then(data => console.log('API 回應:', data))
      .catch(error => console.error('錯誤:', error))
  }

  callLocalHttpServiceDirect = () => {
    console.log('callLocalHttpServiceDirect')
    fetch('http://localhost:3000/users')
      .then(response => response.json())
      .then(data => console.log('API 回應:', data))
      .catch(error => console.error('錯誤:', error))
  }

  // ----- 傳送訊息給main process ----- //

  sendMsgToMainByWebSocket = () => {
    this.websocket.send('web-to-main-send-msg')
  }

  // ----- 透過main process存取本地資料庫 ----- //

  callLocalDbSelect = () => {
    window.api.callLocalDbSelect().then(rows => console.log('callLocalDbSelect', rows))
  }

  callLocalDbUpdate = () => {
    window.api.callLocalDbUpdate({ id: 1, age: 32 }).then(changes => console.log('callLocalDbUpdate', changes))
  }

  // ----- 透過main process存取作業系統檔案 ----- //

  openFile = () => {
    window.api.openFile().then(msg => console.log('openFile:%s', msg))
  }

  openDir = () => {
    window.api.openDir().then(msg => console.log('openDir:%s', msg))
  }

  saveFile = () => {
    window.api.saveFile().then(msg => console.log('saveFile:%s', msg))
  }

  // ----- 透過main process顯示訊息框 ----- //

  showMessageBox = (type, num) => {
    try {
      for (let i = 0; i < num; i++) {
        window.api.showMessageBox(type, '訊息框', '訊息框內容')
      }
    } catch (e) {
      window.api.logError(e.stack)
      window.api.showMessageBox('error', '系統錯誤', e.message ? e.message : '')
    }
  }

  showErrorBox = (num) => {
    for (let i = 0; i < num; i++) {
      window.api.showErrorBox('錯誤訊息框', '錯誤訊息框內容')
    }
  }

  showConfirmMessageBox = () => {
    window.api.showConfirmMessageBox('確認訊息框', '確認訊息框內容').then(msg => console.log(msg))
  }

  showNotification = () => {
    window.api.showNotification('系統通知標題', '系統通知內容')
  }

  render () {
    const envVersionInfo = window.api.getEnvVersionInfo()
    return (
      <Container fluid style={{ backgroundColor: '#28eff5' }}>
        <Row style={{ padding: '10px' }}>
          <Col>chrome版本:{envVersionInfo.chrome}</Col>
          <Col>electron版本:{envVersionInfo.electron}</Col>
        </Row>
        <Row style={rowStyle}><Col>tab2</Col></Row>
        <Row style={rowStyle}><Col>公用狀態</Col></Row>
        <Row style={rowStyle}>
          <Col>
            username:{this.state.username}<br/>
            description:{this.state.description}<br/>
            <Button variant='primary' onClick={this.getSharedState}>取得公用狀態</Button>
          </Col>
        </Row>
        <Row style={rowStyle}><Col>MessagePorts機制</Col></Row>
        <Row style={rowStyle}>
          <Col><Button variant='primary' onClick={() => this.postMessage('port1-to-port2,web-to-main')}>web-to-main message</Button></Col>
        </Row>
        <Row style={rowStyle}><Col>Inter-Process Communication機制(底層測試)</Col></Row>
        <Row style={rowStyle}>
          <Col><Button variant='primary' onClick={this.send}>send(非同步)</Button></Col>
          <Col><Button variant='primary' onClick={this.invoke}>invoke(非同步)</Button></Col>
          <Col><Button variant='primary' onClick={this.sendSync}>sendSync(同步)</Button></Col>
        </Row>
        <Row style={rowStyle}>
          <Col><Button variant='primary' onClick={this.sendMock5}>sendMock5</Button></Col>
          <Col><Button variant='primary' onClick={this.invokeMock5}>invokeMock5</Button></Col>
          <Col><Button variant='primary' onClick={this.sendSyncMock5}>sendSyncMock5</Button></Col>
        </Row>
        <Row style={rowStyle}><Col>http</Col></Row>
        <Row style={rowStyle}>
          <Col><Button variant='primary' onClick={this.callHttpService}>callHttpService</Button></Col>
          <Col><Button variant='primary' onClick={this.callHttpServiceDirect}>callHttpServiceDirect</Button></Col>
          <Col><Button variant='primary' onClick={this.callLocalHttpServiceDirect}>callLocalHttpServiceDirect</Button></Col>
        </Row>
        <Row style={rowStyle}><Col>websocket</Col></Row>
        <Row style={rowStyle}>
          <Col><Button variant='primary' onClick={this.sendMsgToMainByWebSocket}>sendMsgToMainByWebSocket</Button></Col>
        </Row>
        <Row style={rowStyle}><Col>sqlite</Col></Row>
        <Row style={rowStyle}>
          <Col><Button variant='primary' onClick={this.callLocalDbSelect}>callLocalDbSelect</Button></Col>
          <Col><Button variant='primary' onClick={this.callLocalDbUpdate}>callLocalDbUpdate</Button></Col>
        </Row>
        <Row style={rowStyle}><Col>file</Col></Row>
        <Row style={rowStyle}>
          <Col><Button variant='primary' onClick={this.openFile}>openFile</Button></Col>
          <Col><Button variant='primary' onClick={this.openDir}>openDir</Button></Col>
          <Col><Button variant='primary' onClick={this.saveFile}>saveFile</Button></Col>
        </Row>
        <Row style={rowStyle}><Col>msg</Col></Row>
        <Row style={rowStyle}>
          <Col><Button variant='primary' onClick={() => this.showMessageBox('info', 1)}>showMessageBox</Button></Col>
          <Col><Button variant='primary' onClick={() => this.showMessageBox('info', 2)}>showMessageBox 2</Button></Col>
          <Col><Button variant='primary' onClick={() => this.showMessageBox('error', 1)}>showMessageBox(error)</Button></Col>
        </Row>
        <Row style={rowStyle}>
          <Col><Button variant='danger' onClick={() => this.showErrorBox(1)}>showErrorBox</Button></Col>
          <Col><Button variant='danger' onClick={() => this.showErrorBox(2)}>showErrorBox 2</Button></Col>
        </Row>
        <Row style={rowStyle}>
          <Col><Button variant='info' onClick={() => this.showConfirmMessageBox()}>showConfirmMessageBox</Button></Col>
          <Col><Button variant='info' onClick={() => this.showNotification()}>showNotification</Button></Col>
        </Row>
        <Row style={rowStyle}><Col>load local image(無保護機制)(實際應用可能需要考慮 圖片原始檔存放保護,防止未授權存取,防止下載 等議題)</Col></Row>
        <Row style={rowStyle}>
          <Col>
            <img src='http://localhost:3000/image/sample.jpg' alt='image'/>
          </Col>
        </Row>
        <Row style={rowStyle}><Col>load remote image</Col></Row>
        <Row style={rowStyle}>
          <Col>
            <img src='https://upload.wikimedia.org/wikipedia/commons/e/e1/Google_Chrome_icon_%28February_2022%29.svg' alt='image'/>
          </Col>
        </Row>
        <Row style={rowStyle}><Col>load local audio(無保護機制)(實際應用可能需要考慮 音訊原始檔存放保護,防止未授權存取,防止下載 等議題)</Col></Row>
        <Row style={rowStyle}>
          <Col>
            <audio controls src='http://localhost:3000/audio/A0.mp3'></audio>
          </Col>
        </Row>
      </Container>
    )
  }
}
