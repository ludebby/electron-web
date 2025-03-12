import { useState } from 'react'
import { Tabs, Tab, Container } from 'react-bootstrap'

import 'bootstrap/dist/css/bootstrap.min.css'

const TabComponent = () => {
  const [activeTab, setActiveTab] = useState('tab1') // 預設 Tab

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey) // React UI 更新
    window.api.switchTab(tabKey) // 通知 Electron 切換內容
  }

  return (
    <Container fluid style={{ backgroundColor: '#f5dc28' }}>
      <Tabs activeKey={activeTab} onSelect={handleTabChange}>
        <Tab eventKey='tab1' title='分頁 1'></Tab>
        <Tab eventKey='tab2' title='分頁 2'></Tab>
      </Tabs>
    </Container>
  )
}

export default TabComponent
