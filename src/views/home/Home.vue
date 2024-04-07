<template>
  <div class="home">
    <div>
      <div class="home-left">
        <el-divider content-position="left">机台信息</el-divider>
        <div class="button-content" style="display: flex;align-items: center;">
          <span>当前机台为：</span>
          <el-select v-model="machineName" placeholder="请选择" style="width: 150px;">
            <el-option label="机台1" value="机台1" />
            <el-option label="机台2" value="机台2" />
          </el-select>
          <span style="margin-left: 20px;">运行状态：<span style="color: #67c23a;margin-left: 3px;"><i class="el-icon-loading"></i>运行中</span></span>
          <el-button style="margin-left: 20px;" type="primary" size="medium" @click="refresh">刷新</el-button>
        </div>
        <el-divider content-position="left">标签打印</el-divider>
        <div class="button-content" style="display: flex;align-items: center;">
          <el-button type="primary" icon="el-icon-switch-button" size="medium" :loading="runStatus" @click="runPrint">启动打印</el-button>
          <el-button type="danger" icon="el-icon-close" size="medium" @click="stopPrint">停止</el-button>
          <el-button type="primary" size="medium" @click="testPrint">测试</el-button>
          <span style="margin-left: 50px;">选择打印机：</span>
          <el-select v-model="printerName" placeholder="请选择" style="width: 300px;">
            <el-option
              v-for="(item, index) in printers"
              :key="index"
              :label="item.displayName"
              :value="item.displayName">
            </el-option>
          </el-select>
        </div>
        <el-divider content-position="left">标签预览</el-divider>
        <div style="width: 100%; height: calc(100% - 158px);display: flex; align-items: center; justify-content: center;">
          <el-empty v-if="imageSrc === ''" description="暂无打印标签"></el-empty>
          <img v-else :src="imageSrc" class="img-style" style="width: 920px;height: 500px;"/>
        </div>
      </div>
      <div class="home-right">
        <el-divider content-position="left">订单信息</el-divider>
        <span>当前共打印： <span style="color: red">{{ printNum }}</span>份</span>
      </div>
    </div>
  </div>
</template>

<script>
import { Debugger, ipcRenderer } from 'electron'
import grwebapp from '@/utils/grwebapp'
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
      machineName: '机台1',
      printObj: {"Master":[]},
      printNum: 0
    };
  },
  watch: {},
  computed: {},
  methods: {
    refresh(){
      // 重新查询订单信息
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
    }
  },
  created() {
    grwebapp.webapp_urlprotocol_startup();
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
      width: calc(100% - 300px);
      height: 100%;
      box-sizing: border-box;
      padding: 15px;
      .button-content {
        height: 50px;
        width: 100%;
      }
    }
    .home-right {
      width: 300px;
      height: 100%;
      border-left: 1px #DCDFE6 solid;
      box-sizing: border-box;
      padding: 15px;
    }
    ::v-deep {
      .el-divider--horizontal {
        margin: 10px 0;
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