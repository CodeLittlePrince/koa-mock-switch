const path = require('path')
const mockRoot = path.join(__dirname, './mock')
const KoaMockSwitch = require('../../index.js')
const mockSwitchMap = require('./mockSwitchMap.js')
const mock = new KoaMockSwitch(mockRoot, mockSwitchMap, '.htm')

mock.start(7878)