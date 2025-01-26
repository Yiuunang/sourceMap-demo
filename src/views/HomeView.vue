<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { onMounted, ref } from 'vue'
import type { ErrorList } from '../types'
import sourceMap from 'source-map-js'

const js_error = ref<ErrorList>(null)
// 聚焦的 collapse
const activeNames = ref([0])
// 展示对话框
const showDialog = ref(false)
// 聚焦的 tab 名
const activeTabName = ref('local')

let stackFrameObj = {
  line: 0,
  column: 0,
  index: 0,
}

const openDialog = (item: any, index: number) => {
  showDialog.value = true
  stackFrameObj = {
    line: item.lineNumber,
    column: item.columnNumber,
    index: index,
  }
}
// 上传 sourceMap 映射文件
const sourceMapUpload = async (file: File) => {
  if (file.name.substring(file.name.lastIndexOf('.') + 1) !== 'map') {
    ElMessage.error('请上传正确的 sourceMap 文件')
  }

  const reader = new FileReader()
  reader.readAsText(file, 'utf-8')
  reader.onload = async (evt) => {
    const code = await getSource(evt.target?.result, stackFrameObj.line, stackFrameObj.column)
    js_error.value.stack_frames[stackFrameObj.index].origin = code
    showDialog.value = false
  }
}

const getSource = async (sourcemap: any, line: number, column: number) => {
  try {
    // 解析源映射文件
    const consumer = await new sourceMap.SourceMapConsumer(JSON.parse(sourcemap))
    // 使用源映射文件解析错误堆栈中的函数调用(通过报错位置查找源文件的名称以及报错行数)
    const originalPosition = consumer.originalPositionFor({
      line,
      column,
    })

    // 获取报错源代码
    const code = consumer.sourceContentFor(originalPosition.source)

    return {
      source: code,
      column: originalPosition.column,
      line: originalPosition.line,
    }
  } catch (error) {
    ElMessage.error('sourceMap解析失败')
  }
}

onMounted(() => {
  const list = localStorage.getItem('jsErrorList')
  list ? (js_error.value = JSON.parse(list)) : (js_error.value = null)
})
</script>

<template>
  <div v-if="js_error">
    <pre> {{ js_error.stack }} </pre>
    <!-- stack_frames -->
    <hr />
    <el-collapse v-model="activeNames">
      <el-collapse-item
        v-for="(item, index) in js_error.stack_frames"
        :key="index"
        :title="item.source"
        :name="index"
      >
        <el-row :gutter="20">
          <el-col :span="20">
            <div>{{ item.fileName }}</div>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" size="small" @click="openDialog(item, index)"
              >源码映射</el-button
            >
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <template v-if="item.origin"> 源码: {{ item.origin }} </template>
          <template v-else>
            <div>{{ item.fileName }}</div>
          </template>
        </el-row>
      </el-collapse-item>
    </el-collapse>

    <!-- 对话框 -->

    <el-dialog v-model="showDialog" title="soureMap源码映射" width="500">
      <el-tabs v-model="activeTabName" class="demo-tabs">
        <el-tab-pane label="本地上传" name="local">
          <el-upload drag :before-upload="sourceMapUpload">
            <div class="el-upload__text">将文件拖到此处，或者<em>点击上传</em></div>
          </el-upload>
        </el-tab-pane>
        <el-tab-pane label="远程加载" name="request">远程加载</el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>
