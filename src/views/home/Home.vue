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
          <el-descriptions-item label="生产订单ID">{{ nowOrderObj.idScproduct }}</el-descriptions-item>
          <el-descriptions-item label="生产批号">{{ nowOrderObj.ccodeScproduct }}</el-descriptions-item>
          <el-descriptions-item label="产品编号">{{ nowOrderObj.ccodeScaproduc }}</el-descriptions-item>
          <el-descriptions-item label="产品名称">{{ nowOrderObj.cnameScaproduc }}</el-descriptions-item>
          <el-descriptions-item label="客户名称">{{ nowOrderObj.customer }}</el-descriptions-item>
          <el-descriptions-item label="客户品名">{{ nowOrderObj.customerName }}</el-descriptions-item>
          <el-descriptions-item label="委印单号">{{ nowOrderObj.orderNumber }}</el-descriptions-item>
          <el-descriptions-item label="客户批号">{{ nowOrderObj.customerNumber }}</el-descriptions-item>
          <el-descriptions-item label="客户料号">{{ nowOrderObj.customerMaterialNumber }}</el-descriptions-item>
          <el-descriptions-item label="外箱长度">{{ nowOrderObj.length }}</el-descriptions-item>
          <el-descriptions-item label="外箱宽度">{{ nowOrderObj.width }}</el-descriptions-item>
          <el-descriptions-item label="外箱高度">{{ nowOrderObj.height }}</el-descriptions-item>
          <el-descriptions-item label="每箱包装数量">{{ nowOrderObj.namount }}</el-descriptions-item>
          <el-descriptions-item label="箱序号">{{ nowOrderObj.index }}</el-descriptions-item>
          <el-descriptions-item label="生产日期">{{ nowOrderObj.dstatuschange }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </div>
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
      printObj: {"Master":[]},
      printNum: 0,
      configData: {},
      nowOrderObj: {} // 当前展示的订单信息
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
    printLable() {
      var args = {
        type: "print", //设置不同的属性可以执行不同的任务，如：preview print pdf xls csv txt rtf img grd
        // type: "pdf",
        report: grwebapp.urlAddRandomNo(this.grfPath),
        //实际应用中，data应该为程序中通过各种途径获取到的数据，最后要将数据转换为报表需要的XML或JSON格式的字符串数据
        data: this.printObj,
        PrinterName: this.printerName, //指定要输出的打印机名称
        showOptionDlg: false,
      };
      grwebapp.webapp_ws_ajax_run(args);
    },
    testPrint(param) {
      this.printNum++;
      const obj = [{
        customer: '乐泰药业（兰西）有限公司',
        customerName: '12gX3袋亮甲牌肤泰杀菌粉小盒 2312版',
        orderNumber: 'CGJH1-102-X-SC231205-10',
        customerNumber: '202404080001A',
        customerMaterialNumber: 'LXSIF1203-2023121101',
        ccodeScproduct: 'BX2024010089',
        ccodeScaproduc: '0101001550',
        namount: '1000',
        machine: '06/乙',
        qrCode: '01,420x325x310,16.35K,0101000967,2023-12-03,000357',
        index: this.printNum,
        weight: param.weight,
        inspection: '合格/QC05'
      }]
      this.printObj.Master = obj;
      var args = {
        type: "img", //设置不同的属性可以执行不同的任务，如：preview print pdf xls csv txt rtf img grd
        // type: "pdf",
        report: grwebapp.urlAddRandomNo(this.grfPath),
        //实际应用中，data应该为程序中通过各种途径获取到的数据，最后要将数据转换为报表需要的XML或JSON格式的字符串数据
        data: this.printObj,
        showOptionDlg: false,  //指定不显示导出选项对话框
        ImageType: 'png',
        DPI: 288,
        filename: "d:\\label_temp_data\\report\\temp\\temp.png", //指定导出的文件路径与文件名
        open: false  //指定导出后不自动打开文件
      };
      grwebapp.webapp_ws_ajax_run(args);
      setTimeout(() => {
        this.updateImgSrc();
        this.printLable(param);
      }, 500);
    },
    runPrint() {
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
      HttpUtil.post('/order/getOrderBoxInfo', {}).then((res)=> {
        if(res.data) {
          this.nowOrderObj = res.data
        } else {
          this.nowOrderObj = {}
        }
      }).catch((err)=> {
        this.$message.error('查询订单信息出错！稍后自动重试！');
      });
    }
  },
  created() {
    grwebapp.webapp_urlprotocol_startup();
    // 查询机台信息
    this.getMachineList();
    // 加载机台和打印机配置
    this.loadData();
    // 查询当前打印订单信息
    this.getPrintInfo();
  },
  mounted() {
    ipcRenderer.on('get-printers', (event, printers) => {
      this.printers = printers;
      console.log(this.printers)
    });
    ipcRenderer.send('request-printers');
    ipcRenderer.on('getWeightJson', (event, obj) => {
      this.testPrint(obj)
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