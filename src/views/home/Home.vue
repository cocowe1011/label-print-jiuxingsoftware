<template>
  <div class="home">
    <div>
      <div class="home-left">
        <el-divider content-position="left">机台信息</el-divider>
        <div class="button-content" style="display: flex;align-items: center;">
          <span>配置机台名：<span>{{ machineName === '' ? '请配置本地文件': machineName }}</span></span>
          <span style="margin-left: 15px;">作业状态：<span :style="{color: machineTask === null ? 'red': 'green'}"><i class="el-icon-loading" v-if="machineTask !== null"></i>{{ machineTask === null ? '未作业': '作业中' }}</span></span>
          <span style="margin-left: 20px;">当前共打印： <span style="color: red">{{ printNum }}</span>份</span>
          <el-button style="margin-left: 20px;" type="primary" size="medium" @click="refresh">刷新</el-button>
          <el-button style="margin-left: 20px;" type="primary" size="medium" @click="showPrintHistory">查看打印历史</el-button>
          <el-button style="margin-left: 20px;" type="warning" plain size="medium" @click="openStandPop">单机打印{{ isPrintStand ? '（打印中）': '' }}</el-button>
          <div class="jindu_tiao_div" v-show="standPrintPopShow">
            <div class="jindu_title">设置单机打印</div>
            <div class="jindu_context">
              <div class="jindu_context_div">
                <span>设置体重：</span>
                <el-input v-model="standWeightValue" placeholder="请输入" style="width: 220px;margin-left: 5px;" type="number" size="small"></el-input>
              </div>
              <div class="jindu_context_div">
                <span>打印份数：</span>
                <el-input v-model="standPrintNum" placeholder="请输入" style="width: 220px;margin-left: 5px;" type="number" size="small"></el-input>
              </div>
            </div>
            <div class="jindu_jindu_div" v-show="isShowPrintJinDu">
              正在打印，共<span>&nbsp;{{ standPrintNum }}</span>&nbsp;份，当前已打印：<span>&nbsp;{{ nowPrintStandNum > standPrintNum ? standPrintNum : nowPrintStandNum }}&nbsp;</span>
            </div>
            <div class="jindu_button">
              <el-button type="primary" size="small" @click="goingPrintStand" :loading="isPrintStand">开始打印</el-button>
              <el-button type="danger" size="small" @click="stopPrintStand">停止打印</el-button>
              <el-button type="text" size="small" @click="reStandPop">重置数据</el-button>
              <el-button type="text" size="small" @click="closeStandPop">关闭</el-button>
            </div>
          </div>
        </div>
        <el-divider content-position="left">标签打印</el-divider>
        <div class="button-content" style="display: flex;align-items: center;">
          <el-button type="primary" icon="el-icon-switch-button" size="medium" :loading="runStatus" @click="runPrint">启动打印</el-button>
          <el-button type="danger" icon="el-icon-close" size="medium" @click="stopPrint">停止</el-button>
          <el-button size="medium" @click="openReport(grfPath)" :loading="openBoxLoading">标签设计</el-button>
          <el-tooltip class="item" effect="dark" content="设置标签数据" placement="top-start">
            <el-button size="medium" type="primary" icon="el-icon-edit" circle @click="showLableDataView"></el-button>
          </el-tooltip>
          <span style="margin-left: 25px;">选择打印机：</span>
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
        <div style="width: 100%; height: calc(100% - 158px);display: flex; align-items: center; justify-content: center;" v-loading="labelLoading">
          <el-empty v-if="imageSrc === ''" description="暂无打印标签"></el-empty>
          <img v-else :src="imageSrc" class="img-style" style="width: 920px;height: 500px;"/>
        </div>
      </div>
      <div class="home-right">
        <el-divider content-position="left">当前订单信息</el-divider>
        <div style="height: calc(100% - 8px);width:100%;overflow: auto;">
          <el-descriptions style="margin-top:10px;" :column="1" size="medium" border>
            <el-descriptions-item label="生产订单ID">{{ nowOrderObj.idScproduct === undefined ? '未查询到可打印信息': nowOrderObj.idScproduct }}</el-descriptions-item>
            <el-descriptions-item label="生产批号">{{ nowOrderObj.ccodeScproduct === undefined ? '未查询到可打印信息': nowOrderObj.ccodeScproduct }}</el-descriptions-item>
            <el-descriptions-item label="产品编号">{{ nowOrderObj.ccodeScaproduct === undefined ? '未查询到可打印信息': nowOrderObj.ccodeScaproduct }}</el-descriptions-item>
            <el-descriptions-item label="产品名称">{{ nowOrderObj.cnameScaproduct === undefined ? '未查询到可打印信息': nowOrderObj.cnameScaproduct }}</el-descriptions-item>
            <el-descriptions-item label="客户名称">{{ nowOrderObj.customer === undefined ? '未查询到可打印信息': nowOrderObj.customer }}</el-descriptions-item>
            <el-descriptions-item label="客户品名">{{ nowOrderObj.customerName === undefined ? '未查询到可打印信息': nowOrderObj.customerName }}</el-descriptions-item>
            <el-descriptions-item label="委印单号">{{ nowOrderObj.orderNumber === undefined ? '未查询到可打印信息': nowOrderObj.orderNumber }}</el-descriptions-item>
            <el-descriptions-item label="客户批号">{{ nowOrderObj.customerNumber === undefined ? '未查询到可打印信息': nowOrderObj.customerNumber }}</el-descriptions-item>
            <el-descriptions-item label="客户料号">{{ nowOrderObj.customerMaterialNumber === undefined ? '未查询到可打印信息': nowOrderObj.customerMaterialNumber }}</el-descriptions-item>
            <el-descriptions-item label="外箱长度">{{ nowOrderObj.length === undefined ? '未查询到可打印信息': nowOrderObj.length }}</el-descriptions-item>
            <el-descriptions-item label="外箱宽度">{{ nowOrderObj.width === undefined ? '未查询到可打印信息': nowOrderObj.width }}</el-descriptions-item>
            <el-descriptions-item label="外箱高度">{{ nowOrderObj.height === undefined ? '未查询到可打印信息': nowOrderObj.height }}</el-descriptions-item>
            <el-descriptions-item label="每箱包装数量">{{ nowOrderObj.namount === undefined ? '未查询到可打印信息': nowOrderObj.namount }}</el-descriptions-item>
            <el-descriptions-item label="箱序号">{{ nowOrderObj.iindex === undefined ? '未查询到可打印信息': nowOrderObj.iindex }}</el-descriptions-item>
            <el-descriptions-item label="生产日期">{{ nowOrderObj.dstatuschange === undefined ? '未查询到可打印信息': nowOrderObj.dstatuschange }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </div>
    <el-dialog
      title="查看打印历史"
      :visible.sync="dialogVisible"
      width="1200px"
      :before-close="handleClose"
      append-to-body
      destroy-on-close
      >
      <ViewPrintLogList :machineName="machineName" v-if="dialogVisible" @rePrint="rePrint" ref="viewPrintLogListRef"/>
    </el-dialog>
    <el-dialog
      title="设置标签数据"
      :visible.sync="setLabelDataView"
      width="300px"
      :before-close="handleCloseLableDataView"
      append-to-body
      destroy-on-close
      >
      <div style="height: 50px;width: 100%;display: flex;align-items: center;justify-content: center;">
        <div style="font-size: 14px;width:60px;height:20px;display: flex;justify-content:flex-end;">标签号：</div>
        <el-input v-model="iboxtagSetValue" placeholder="请输入内容" style="width: 200px;margin-left: 5px;" type="number"></el-input>
      </div>
      <div style="height: 50px;width: 100%;display: flex;align-items: center;justify-content: center;">
        <div style="font-size: 14px;width:60px;height:20px;display: flex;justify-content:flex-end;">检验：</div>
        <el-input v-model="inspectionSetValue" placeholder="请输入内容" style="width: 200px;margin-left: 5px;"></el-input>
      </div>
      <div style="height: 50px;width: 100%;display: flex;align-items: center;justify-content: center;">
        <div style="font-size: 14px;width:60px;height:20px;display: flex;justify-content:flex-end;">班次：</div>
        <el-input v-model="cclassSetValue" placeholder="请输入内容" style="width: 200px;margin-left: 5px;"></el-input>
      </div>
      <div style="height: 50px;width: 100%;display: flex;align-items: center;justify-content: center;">
        <div style="font-size: 14px;width:60px;height:20px;display: flex;justify-content:flex-end;">数量：</div>
        <el-input v-model="namountSetValue" placeholder="请输入内容" style="width: 200px;margin-left: 5px;" type="number"></el-input>
      </div>
      <div style="height: 50px;width: 100%;display: flex;align-items: center;justify-content: center;">
        <div style="font-size: 14px;width:60px;height:20px;display: flex;justify-content:flex-end;">备注：</div>
        <el-input v-model="cremarkSetValue" placeholder="请输入内容" style="width: 200px;margin-left: 5px;"></el-input>
      </div>
      <div style="height: 50px;width: 100%;display: flex;align-items: center;justify-content: center;">
        <el-button style="margin-left: 20px;" type="primary" size="medium" @click="saveLabelSetData">保存</el-button>
        <el-button type="danger" size="medium" style="margin-left: 15px;" @click="handleCloseLableDataView">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { Debugger, ipcRenderer } from 'electron'
import grwebapp from '@/utils/grwebapp'
import HttpUtil from '@/utils/HttpUtil'
import ViewPrintLogList from './ViewPrintLogList.vue'
const { exec } = require('child_process');
const os = require('os');
import { EventBus } from './eventBus';
export default {
  name: "Home",
  components: {
    ViewPrintLogList
  },
  props: {},
  data() {
    return {
      runStatus: false,
      printers: [],
      printerName: '',
      grfPath: 'D://label_temp_data/report/labelPrint.grf',
      imageSrc: '',
      machineName: '',
      machineTask: null,
      printNum: 0,
      configData: {},
      nowOrderObj: {}, // 当前展示的订单信息
      dialogVisible: false,
      openBoxLoading: false,
      labelLoading: false,
      setLabelDataView: false,
      inspectionSetValue: '',
      standPrintPopShow: false,
      isPrintStand: false,
      standWeightValue: 0,
      standPrintNum: 0,
      nowPrintStandNum: 0,
      isShowPrintJinDu: false,
      iboxtagSetValue: 0,
      cclassSetValue: '',
      namountSetValue: '', // 数量
      cremarkSetValue: '' // 备注
    };
  },
  watch: {},
  computed: {},
  methods: {
    standPrint() {
      if(Object.keys(this.nowOrderObj).length === 0) {
        this.$message.error('打印已停止！无可打印的订单！')
        this.isPrintStand = false
      } else {
        if(this.nowPrintStandNum < this.standPrintNum) {
          this.nowPrintStandNum++;
          // 调用打印机
          this.printLable(this.standWeightValue)
        } else {
          this.$message.success('打印已完成，自动停止打印！')
          this.isPrintStand = false
        }
      }
    },
    goingPrintStand() {
      // 判断当前有没有可以打印的订单
      if(Object.keys(this.nowOrderObj).length === 0) {
        this.$message.error('当前无可打印的订单！')
        return false
      }
      // 先判断整体的打印按钮有没有开启
      if (this.runStatus) {
        // 判断体重和打印份数是否都大于0
        if (this.standWeightValue > 0 && this.standPrintNum >0) {
          // 开启循环打印，展示当前打印了
          this.isPrintStand = true
          this.isShowPrintJinDu = true
          this.standPrint();
        } else {
          this.$message.error('体重和打印份数必须为大于0的数字!')
        }
      } else {
        this.$message.error('请先启动打印！')
      }
      
    },
    stopPrintStand() {
      this.isPrintStand = false
    },
    openStandPop() {
      this.standPrintPopShow = true
    },
    reStandPop() {
      if(this.isPrintStand) {
        this.$message.error('请先停止打印！');
      } else {
        this.standWeightValue = 0;
        this.standPrintNum = 0;
        this.nowPrintStandNum = 0;
        this.isShowPrintJinDu = false
      }
    },
    closeStandPop() {
      this.standPrintPopShow = false
    },
    rePrint(obj) {
      console.log(obj)
      // 1、打印标签
      const printObj = {"Master":[obj]};
      var args = {
        type: "print", //设置不同的属性可以执行不同的任务，如：preview print pdf xls csv txt rtf img grd
        // type: "pdf",
        report: grwebapp.urlAddRandomNo(this.grfPath),
        //实际应用中，data应该为程序中通过各种途径获取到的数据，最后要将数据转换为报表需要的XML或JSON格式的字符串数据
        data: printObj,
        PrinterName: this.printerName, //指定要输出的打印机名称
        showOptionDlg: false,
      };
      grwebapp.webapp_ws_ajax_run(args);
      this.$message.success('打印成功！')
      // 2、回更补打印次数
      const param = {
        id: obj.id,
        reprintingTime: obj.reprintingTime + 1
      }
      HttpUtil.post('/order/update', param).then((res)=> {
        if(res.data && res.data > 0) {
          // 3、打印成功重新查询订单参数
          this.$refs.viewPrintLogListRef.getOrderListSearchParam();
        } else {
          this.$message.error('未成功更新补打印次数！请重试！')
        }
      }).catch((err)=> {
        this.$message.error('未成功更新补打印次数！请重试！')
      });
      
    },
    showPrintHistory() {
      this.dialogVisible = true
    },
    handleClose() {
      this.dialogVisible = false
    },
    showLableDataView() {
      // 查询本地配置
      this.setLabelDataView = true;
    },
    handleCloseLableDataView() {
      this.setLabelDataView = false;
      this.refresh()
    },
    async refresh(){
      // 重新查询订单信息
      this.labelLoading = true
      await this.getMachineTask();
      // 查询当前打印订单信息
      await this.getPrintInfo();
      setTimeout(() => {
        this.labelLoading = false
      }, 500);
    },
    updateImgSrc() {
      this.imageSrc = 'D://label_temp_data/report/temp/temp.png?' + new Date().getTime();
    },
    testPrint() {
      const printObj = {"Master":[]};
      const obj = [{
        customer: '乐泰药业（兰西）有限公司',
        customerName: '12gX3袋亮甲牌肤泰杀菌粉小盒 2312版',
        orderNumber: 'CGJH1-102-X-SC231205-10',
        customerNumber: '202404080001A',
        customerMaterialNumber: 'LXSIF1203-2023121101',
        ccodeScproduct: 'BX2024010089',
        ccodeScaproduct: '0101001550',
        namount: '1000',
        machine: '06/乙',
        cclass: '06/测试',
        qrCode: '01,420x325x310,16.35K,0101000967,2023-12-03,000357',
        iIndex: '00001',
        weight: '13.66',
        inspection: '合格/QC05',
        cremark: '测试备注'
      }]
      printObj.Master = obj;
      var args = {
        type: "print", //设置不同的属性可以执行不同的任务，如：preview print pdf xls csv txt rtf img grd
        // type: "pdf",
        report: grwebapp.urlAddRandomNo(this.grfPath),
        //实际应用中，data应该为程序中通过各种途径获取到的数据，最后要将数据转换为报表需要的XML或JSON格式的字符串数据
        data: printObj,
        PrinterName: this.printerName, //指定要输出的打印机名称
        showOptionDlg: false,
      };
      grwebapp.webapp_ws_ajax_run(args);
    },
    async printLable(weight) {
      const printObj = {"Master":[]};
      this.nowOrderObj.nweight = weight
      this.nowOrderObj.qrCode = this.nowOrderObj.qrCode + ',' + weight + 'Kg' + ',' + this.nowOrderObj.idScproduct + ',' + this.nowOrderObj.dstatuschange + ',' + this.nowOrderObj.iindex + ',' + this.machineTask.machine
      printObj.Master = [this.nowOrderObj];
      var args = {
        type: "print", //设置不同的属性可以执行不同的任务，如：preview print pdf xls csv txt rtf img grd
        // type: "pdf",
        report: grwebapp.urlAddRandomNo(this.grfPath),
        //实际应用中，data应该为程序中通过各种途径获取到的数据，最后要将数据转换为报表需要的XML或JSON格式的字符串数据
        data: printObj,
        PrinterName: this.printerName, //指定要输出的打印机名称
        showOptionDlg: false,
      };
      grwebapp.webapp_ws_ajax_run(args);
      this.printNum++;
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
    },
    runPrint() {
      if(this.machineTask === null) {
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
    async saveLabelSetData() {
      const obj = JSON.parse(await ipcRenderer.invoke('read-config-file'))
      obj.inspectionSetValue = this.inspectionSetValue;
      obj.iboxtagSetValue = this.iboxtagSetValue;
      obj.cclassSetValue = this.cclassSetValue;
      this.updateData(obj)
    },
    async changePrinterName(value) {
      const obj = JSON.parse(await ipcRenderer.invoke('read-config-file'))
      obj.printerName = value;
      this.updateData(obj)
    },
    async getMachineTask() {
      this.machineTask = null
      if(this.machineName != '') {
        await HttpUtil.post('/order/getMachineTask', {"machine": this.machineName}).then((res)=> {
          if(res.data&&res.data.length > 0) {
            this.machineTask = res.data[0]
          }
        }).catch((err)=> {
          this.$message.error('查询机台任务出错！请刷新重试！');
        });
      }
    },
    async loadData() {
      try {
        this.configData = JSON.parse(await ipcRenderer.invoke('read-config-file'))
        this.machineName = (this.configData.machineName === undefined || this.configData.machineName === null) ? '' : this.configData.machineName
        this.printerName = this.configData.printerName
        this.inspectionSetValue = this.configData.inspectionSetValue
        this.iboxtagSetValue = this.configData.iboxtagSetValue
        this.cclassSetValue = this.configData.cclassSetValue
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
    async getPrintInfo() {
      if (this.machineTask != null) {
        // 查询按照箱编号正序排序的第一个订单信息
        const param = {"machine": this.machineTask.machine, "idScproduct": this.machineTask.idScproduct}
        // 查询信息时将订单状态给更新，防止其他机台操作数据，保证数据原子性
        HttpUtil.post('/order/getOrderBoxInfo', param).then((res)=> {
          if(res.data) {
            this.nowOrderObj = res.data
            this.nowOrderObj.machine = this.machineTask.machine
            this.nowOrderObj.inspection = this.inspectionSetValue
            this.nowOrderObj.qrCode = (this.machineTask.machine === 'M-5#ZHJ' ? '02' : '01') + ',' + this.nowOrderObj.length + 'x' + this.nowOrderObj.width + 'x' + this.nowOrderObj.width
            this.nowOrderObj.nweight = this.nowOrderObj.nweight === 0 ? '': this.nowOrderObj.nweight
            this.nowOrderObj.iboxtag = this.iboxtagSetValue
            this.nowOrderObj.cclass = this.cclassSetValue
            // 判断用户有没有设置备注和数量，如果有，替换为用户自己设置的数量和备注
            if(this.cremarkSetValue !== '') {
              this.nowOrderObj.cremark = this.cremarkSetValue
            }
            if(this.namountSetValue !== '') {
              this.nowOrderObj.namount = this.namountSetValue
            }
          } else {
            // 没有订单可打印了，展示空白即可
            this.nowOrderObj = {}
          }
          // 展示图片
          console.log(this.nowOrderObj)
          this.showLabelImg(this.nowOrderObj);
        }).catch((err)=> {
          this.$message.error('查询订单信息出错！稍后自动重试！');
        });
      } else {
        this.nowOrderObj = {}
      }
    },
    openReport(filePath) {
      this.openBoxLoading = true
      let command;
      switch (os.platform()) {
        case 'win32': // Windows
          command = `start "" "${filePath}"`;
          break;
        case 'darwin': // macOS
          command = `open "${filePath}"`;
          break;
        case 'linux': // Linux
          command = `xdg-open "${filePath}"`;
          break;
        default:
          this.$message.error('不支持的操作系统！');
          return;
      }

      // 执行打开文件的命令
      exec(command, (error, stdout, stderr) => {
        if (error) {
          this.$message.error(`无法打开文件：${filePath}`);
          console.error(error);
          this.openBoxLoading = false
          return;
        }
        this.openBoxLoading = false
        this.$message.success('文件已成功打开！');
      });
    }
  },
  async created() {
    grwebapp.webapp_urlprotocol_startup();
    // 监听事件
    EventBus.$on('message-received', (data) => {
      console.log('eventBus收到消息', data)
      if(data.event === 'ExportEnd' && data.type === 'img') {
        this.updateImgSrc();
        if (this.isPrintStand) {
          this.standPrint()
        }
      }
    });
    // 加载机台和打印机配置
    await this.loadData();
    // 查询机台信息
    await this.getMachineTask();
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
  },
  beforeDestroy() {
    // 停止监听事件以避免内存泄露
    EventBus.$off('message-received');
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
        .jindu_tiao_div {
          position: absolute;
          background: #fff;
          border-radius: 4px;
          z-index: 2000;
          color: #606266;
          box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
          width: 400px;
          height: 180px;
          top: 83px;
          left: 600px;
          .jindu_title {
            height: 35px;
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 15px;
            font-weight: 700;
          }
          .jindu_context {
            width: 100%;
            height: 80px;
            .jindu_context_div {
              width: 100%;
              height: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
              // box-sizing: border-box;
              // padding-left: 15px;
            }
          }
          .jindu_button {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 45px;
          }
          .jindu_jindu_div {
            width: 100%;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
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
::v-deep .el-dialog__body {
  padding: 8px 20px;
}
// 滚动槽样式定义
::-webkit-scrollbar {
  width: 5px;
  height: 8px;
}

::-webkit-scrollbar-thumb {
  border-radius: 3px;
  background-color: #c2c8cc !important;
}

::-webkit-scrollbar-thumb:window-inactive {
  background-color: #c2c8cc;
}
</style>