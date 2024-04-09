<template>
  <div class="home">
    <div>
      <div class="home-left">
        <el-divider content-position="left">机台信息</el-divider>
        <div class="button-content" style="display: flex;align-items: center;">
          <span>当前机台为：</span>
          <el-select v-model="machineName" @change="selectMachine" placeholder="请选择" style="width: 150px;">
            <el-option label="机台1" value="机台1" />
            <el-option label="机台2" value="机台2" />
          </el-select>
          <span style="margin-left: 20px;">运行状态：<span style="color: #67c23a;margin-left: 3px;"><i class="el-icon-loading"></i>运行中</span></span>
          <span style="margin-left: 20px;">当前共打印： <span style="color: red">{{ printNum }}</span>份</span>
          <el-button style="margin-left: 20px;" type="primary" size="medium" @click="showPrintHistory">打印历史</el-button>
          <el-button style="margin-left: 20px;" type="primary" size="medium" @click="refresh">刷新</el-button>
        </div>
        <el-divider content-position="left">标签打印</el-divider>
        <div class="button-content" style="display: flex;align-items: center;">
          <el-button type="primary" icon="el-icon-switch-button" size="medium" :loading="runStatus" @click="runPrint">启动打印</el-button>
          <el-button type="danger" icon="el-icon-close" size="medium" @click="stopPrint">停止</el-button>
          <el-button size="medium">标签设计</el-button>
          <span style="margin-left: 50px;">选择打印机：</span>
          <el-select v-model="printerName" @change="changePrinterName" placeholder="请选择" style="width: 300px;">
            <el-option
              v-for="(item, index) in printers"
              :key="index"
              :label="item.displayName"
              :value="item.displayName">
            </el-option>
          </el-select>
          <el-button type="primary" size="medium" @click="testPrint" style="margin-left: 15px;">测试打印</el-button>
        </div>
        <el-divider content-position="left">标签预览</el-divider>
        <div style="width: 100%; height: calc(100% - 158px);display: flex; align-items: center; justify-content: center;">
          <el-empty v-if="imageSrc === ''" description="暂无打印标签"></el-empty>
          <img v-else :src="imageSrc" class="img-style" style="width: 920px;height: 500px;"/>
        </div>
      </div>
      <div class="home-right">
        <el-divider content-position="left">当前订单信息</el-divider>
        <el-descriptions style="margin-top:20px;" :column="1" size="medium" border>
          <el-descriptions-item label="生产订单ID">{{ nowOrderObj.idScproduct === undefined ? '未查询到可打印信息': nowOrderObj.idScproduct }}</el-descriptions-item>
          <el-descriptions-item label="生产批号">{{ nowOrderObj.ccodeScproduct === undefined ? '未查询到可打印信息': nowOrderObj.ccodeScproduct }}</el-descriptions-item>
          <el-descriptions-item label="产品编号">{{ nowOrderObj.ccodeScaproduc === undefined ? '未查询到可打印信息': nowOrderObj.ccodeScaproduc }}</el-descriptions-item>
          <el-descriptions-item label="产品名称">{{ nowOrderObj.cnameScaproduc === undefined ? '未查询到可打印信息': nowOrderObj.cnameScaproduc }}</el-descriptions-item>
          <el-descriptions-item label="客户名称">{{ nowOrderObj.customer === undefined ? '未查询到可打印信息': nowOrderObj.customer }}</el-descriptions-item>
          <el-descriptions-item label="客户品名">{{ nowOrderObj.customerName === undefined ? '未查询到可打印信息': nowOrderObj.customerName }}</el-descriptions-item>
          <el-descriptions-item label="委印单号">{{ nowOrderObj.orderNumber === undefined ? '未查询到可打印信息': nowOrderObj.orderNumber }}</el-descriptions-item>
          <el-descriptions-item label="客户批号">{{ nowOrderObj.customerNumber === undefined ? '未查询到可打印信息': nowOrderObj.customerNumber }}</el-descriptions-item>
          <el-descriptions-item label="客户料号">{{ nowOrderObj.customerMaterialNumber === undefined ? '未查询到可打印信息': nowOrderObj.customerMaterialNumber }}</el-descriptions-item>
          <el-descriptions-item label="外箱长度">{{ nowOrderObj.length === undefined ? '未查询到可打印信息': nowOrderObj.length }}</el-descriptions-item>
          <el-descriptions-item label="外箱宽度">{{ nowOrderObj.width === undefined ? '未查询到可打印信息': nowOrderObj.width }}</el-descriptions-item>
          <el-descriptions-item label="外箱高度">{{ nowOrderObj.height === undefined ? '未查询到可打印信息': nowOrderObj.height }}</el-descriptions-item>
          <el-descriptions-item label="每箱包装数量">{{ nowOrderObj.namount === undefined ? '未查询到可打印信息': nowOrderObj.namount }}</el-descriptions-item>
          <el-descriptions-item label="箱序号">{{ nowOrderObj.index === undefined ? '未查询到可打印信息': nowOrderObj.index }}</el-descriptions-item>
          <el-descriptions-item label="生产日期">{{ nowOrderObj.dstatuschange === undefined ? '未查询到可打印信息': nowOrderObj.dstatuschange }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </div>
    <el-drawer
      title="我是标题"
      :visible.sync="drawer"
      :with-header="false"
      size="70%">
      <span>我来啦!</span>
    </el-drawer>
  </div>
</template>

<script>
import { Debugger, ipcRenderer } from 'electron'
import grwebapp from '@/utils/grwebapp'
import HttpUtil from '@/utils/HttpUtil'
export default {
  name: "Home",
  components: {},
  props: {},
  data() {
    return {
      runStatus: false,
      printers: [],
      printerName: '',
      grfPath: 'D://label_temp_data/report/labelPrint.grf',
      imageSrc: '',
      machineName: '',
      machineList: [],
      printNum: 0,
      configData: {},
      nowOrderObj: {}, // 当前展示的订单信息
      drawer: true
    };
  },
  watch: {},
  computed: {},
  methods: {
    refresh(){
      // 重新查询订单信息
      this.getMachineList();
    },
    updateImgSrc() {
      this.imageSrc = 'D://label_temp_data/report/temp/temp.png?' + new Date().getTime();
    },
    testPrint() {},
    async printLable(weight) {
      const printObj = {"Master":[]};
      this.nowOrderObj.weight = weight
      printObj.Master = this.nowOrderObj;
      // var args = {
      //   type: "print", //设置不同的属性可以执行不同的任务，如：preview print pdf xls csv txt rtf img grd
      //   // type: "pdf",
      //   report: grwebapp.urlAddRandomNo(this.grfPath),
      //   //实际应用中，data应该为程序中通过各种途径获取到的数据，最后要将数据转换为报表需要的XML或JSON格式的字符串数据
      //   data: printObj,
      //   PrinterName: this.printerName, //指定要输出的打印机名称
      //   showOptionDlg: false,
      // };
      // grwebapp.webapp_ws_ajax_run(args);
      console.log(this.nowOrderObj)
      // 更新这个订单的一些状态，然后反馈日志信息到中间表
      await this.dealAfterPrint(this.nowOrderObj)
      // 马上查询下一个订单
      this.getPrintInfo();
    },
    async dealAfterPrint(param) {
      await HttpUtil.post('/order/dealAfterPrint', param).then((res)=> {
        // 输出打印成功的日志
        if(res.data>0) {
          this.$message.success('已插入日志记录')
        } else {
          this.$message.error('日志插入失败！即将重新打印')
        }
        // 失败了给予失败提示
      }).catch((err)=> {
        // 失败了给予失败提示
        this.$message.error('日志插入失败！即将重新打印')
      });
    },
    showLabelImg(param) {
      const obj = [param]
      const printObj = {"Master":[]};
      printObj.Master = obj;
      var args = {
        type: "img", //设置不同的属性可以执行不同的任务，如：preview print pdf xls csv txt rtf img grd
        // type: "pdf",
        report: grwebapp.urlAddRandomNo(this.grfPath),
        //实际应用中，data应该为程序中通过各种途径获取到的数据，最后要将数据转换为报表需要的XML或JSON格式的字符串数据
        data: printObj,
        showOptionDlg: false,  //指定不显示导出选项对话框
        ImageType: 'png',
        DPI: 288,
        filename: "d:\\label_temp_data\\report\\temp\\temp.png", //指定导出的文件路径与文件名
        open: false  //指定导出后不自动打开文件
      };
      grwebapp.webapp_ws_ajax_run(args);
      setTimeout(() => {
        this.updateImgSrc();
      }, 500);
    },
    runPrint() {
      if(this.machineName === '') {
        this.$message.error('请选择机台！')
        return false;
      }
      this.runStatus = true
      this.$message.success('已启动！')
    },
    stopPrint() {
      this.runStatus = false
      this.$message.success('已停止！')
    },
    async selectMachine(value) {
      const obj = JSON.parse(await ipcRenderer.invoke('read-config-file'))
      obj.machineName = value;
      this.updateData(obj)
    },
    async changePrinterName(value) {
      const obj = JSON.parse(await ipcRenderer.invoke('read-config-file'))
      obj.printerName = value;
      this.updateData(obj)
    },
    getMachineList() {
      this.machineList = []
      HttpUtil.post('/order/getMachineList', {}).then((res)=> {
        if(res.data&&res.data.length > 0) {
          this.machineList = res.data
        }
      }).catch((err)=> {
        this.$message.error('查询机台任务出错！请刷新重试！');
      });
    },
    async loadData() {
      try {
        this.configData = JSON.parse(await ipcRenderer.invoke('read-config-file'))
        this.machineName = this.configData.machineName
        this.printerName = this.configData.printerName
      } catch (error) {
        console.error('Error:', error)
      }
    },
    async updateData(data) {
      try {
        await ipcRenderer.invoke('update-config-file', data)
        this.$message.success('设置成功！')
      } catch (error) {
        console.error('Error:', error)
      }
    },
    getPrintInfo() {
      // 查询按照箱编号正序排序的第一个订单信息
      const param = {"machine": this.machineName}
      // 查询信息时将订单状态给更新，防止其他机台操作数据，保证数据原子性
      HttpUtil.post('/order/getOrderBoxInfo', param).then((res)=> {
        if(res.data) {
          this.nowOrderObj = res.data
          this.nowOrderObj.machine = this.machineName
        } else {
          // 没有订单可打印了，展示空白即可
          this.nowOrderObj = {}
        }
        // 展示图片
        this.showLabelImg(this.nowOrderObj);
      }).catch((err)=> {
        this.$message.error('查询订单信息出错！稍后自动重试！');
      });
    }
  },
  async created() {
    grwebapp.webapp_urlprotocol_startup();
    // 查询机台信息
    this.getMachineList();
    // 加载机台和打印机配置
    await this.loadData();
    // 查询当前打印订单信息
    this.getPrintInfo();
  },
  mounted() {
    ipcRenderer.on('get-printers', (event, printers) => {
      this.printers = printers;
    });
    ipcRenderer.send('request-printers');
    ipcRenderer.on('getWeightJson', (event, obj) => {
      // 1、判断有没有开启打印按钮
      if (this.runStatus) {
        // 2、打印当前展示的标签，将标签打印，等待下一次体重的发送
        if (Object.keys(this.nowOrderObj).length === 0 && this.nowOrderObj.constructor === Object) {
          this.$message.error('未查询到当前有可打印的订单信息！请刷新重试！')
        } else {
          this.printLable(obj.weight)
        }
      } else {
        this.$message.error('收到体重,未开始打印,不允许打印！')
      }
    })
  }
};
</script>
<style lang="less" scoped>
.home {
  width: 100%;
  height: 100%;
  padding: 15px;
  box-sizing: border-box;
  > div {
    width: 100%;
    height: 100%;
    opacity: 1;
    border-radius: 20px;
    background: rgb(255, 255, 255);
    box-shadow: 0px 60px 90px 0px rgba(0, 0, 0, 0.2);
    position: relative;
    display: flex;
    .home-left {
      width: calc(100% - 350px);
      height: 100%;
      box-sizing: border-box;
      padding: 15px;
      .button-content {
        height: 50px;
        width: 100%;
      }
    }
    .home-right {
      width: 350px;
      height: 100%;
      border-left: 1px #DCDFE6 solid;
      box-sizing: border-box;
      padding: 15px;
    }
    ::v-deep {
      .el-divider--horizontal {
        margin: 10px 0;
      }
      .el-descriptions-item__label.is-bordered-label {
        width: 120px;
        font-weight: 650 !important;
      }
      .el-descriptions-item__content {
        font-weight: 650 !important;
      }
    }
  }
  .img-style {
    border: 4px solid #ccc; /* 灰色边框 */
    border-radius: 15px; /* 边框圆角 */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5); /* 阴影效果 */
  }
}
</style>