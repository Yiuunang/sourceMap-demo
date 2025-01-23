import axios from 'axios'
import type ErrorStackParser from 'error-stack-parser'

// 引入source-map-js库，用于解析源映射文件
import sourceMap from 'source-map-js'

// 定义一个异步函数，用于获取源映射文件
const getSourceMapFile = async (url: string) => {
  // 使用axios库发送GET请求，获取url对应的源映射文件
  const res = await axios.get(url) // 实际项目中是存放在服务器上的，这里直接将 map 文件打包部署上线了，实际项目中不应该部署上线，应该存放在服务器上
  // 返回获取到的源映射文件数据
  return res.data
}

// 根据源映射文件还原报错代码
const findCodeBySourceMap = async (stackFrame: ErrorStackParser.StackFrame) => {
  // 如果报错堆栈中没有文件名、行号或列号，则返回
  if (!stackFrame.fileName || !stackFrame.lineNumber || !stackFrame.columnNumber) return
  // 获取 map 文件
  const sourceMapFile = await getSourceMapFile(stackFrame.fileName + '.map')

  // 解析源映射文件
  const consumer = await new sourceMap.SourceMapConsumer(sourceMapFile)
  // 使用源映射文件解析错误堆栈中的函数调用(通过报错位置查找源文件的名称以及报错行数)
  const originalPosition = consumer.originalPositionFor({
    line: stackFrame.lineNumber,
    column: stackFrame.columnNumber,
  })

  // 获取报错源代码
  const code = consumer.sourceContentFor(originalPosition.source)

  console.warn('还原之后的报错代码', code)
}

export { findCodeBySourceMap }
