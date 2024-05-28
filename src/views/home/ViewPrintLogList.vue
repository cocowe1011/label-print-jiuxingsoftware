<template>
  <div style="width: 100%; height: 550px;">
    <div class="search">
      <span>表ID</span>
      <el-input placeholder="请输入表ID" v-model="tableId" style="width: 200px;margin-left: 10px;" size="small" clearable></el-input>
      <span>生产订单ID</span>
      <el-input placeholder="请输入生产订单ID" v-model="idScproduct" style="width: 200px;margin-left: 10px;" size="small" clearable></el-input>
      <span style="margin-left: 10px;">生产订单号</span>
      <el-input placeholder="请输入生产订单号" v-model="ccodeScproduct" style="width: 200px;margin-left: 10px;" size="small" clearable></el-input>
      <span style="margin-left: 10px;">箱序号</span>
      <el-input placeholder="请输入箱序号" v-model="boxIndex" style="width: 200px;margin-left: 10px;" size="small" clearable></el-input>
      <el-button style="margin-left: 10px;" size="small" type="primary" @click="getOrderListSearch">查询</el-button>
    </div>
    <div class="tableDiv">
      <el-table
        :data="tableData"
        border
        height="100%"
        style="width: 100%">
        <el-table-column type="index" width="60" :index="indexMethod" label="序号" fixed="left">
        </el-table-column>
        <el-table-column
          prop="dstatuschange"
          label="生产日期"
          width="180"
          fixed="left">
        </el-table-column>
        <el-table-column
          prop="idScproduct"
          label="生产订单ID"
          width="180">
        </el-table-column>
        <el-table-column
          prop="idRequest"
          label="产品版本ID"
          width="160">
        </el-table-column>
        <el-table-column
          prop="ccodeScproduct"
          label="生产订单号"
          width="160">
        </el-table-column>
        <el-table-column
          prop="reprintingTime"
          label="补打印次数"
          width="160">
        </el-table-column>
        <el-table-column
          prop="iindex"
          label="箱序号"
          width="160">
        </el-table-column>
        <el-table-column
          prop="nweight"
          label="重量"
          width="160">
        </el-table-column>
        <el-table-column
          prop="iboxtag"
          label="标签号"
          width="160">
        </el-table-column>
        <el-table-column
          prop="ccodeScaproduct"
          label="产品编号"
          width="160">
        </el-table-column>
        <el-table-column
          prop="cnameScaproduct"
          label="产品名称"
          width="160">
        </el-table-column>
        <el-table-column
          prop="customerName"
          label="客户品名"
          width="160">
        </el-table-column>
        <el-table-column
          prop="orderNumber"
          label="委印单号"
          width="160">
        </el-table-column>
        <el-table-column
          prop="customerNumber"
          label="客户批号"
          width="160">
        </el-table-column>
        <el-table-column
          prop="customerMaterialNumber"
          label="客户料号"
          width="160">
        </el-table-column>
        <el-table-column
          prop="inspection"
          label="检验合格信息"
          width="160">
        </el-table-column>
        <el-table-column
          prop="length"
          label="外箱长度"
          width="160">
        </el-table-column>
        <el-table-column
          prop="width"
          label="外箱宽度"
          width="160">
        </el-table-column>
        <el-table-column
          prop="height"
          label="外箱高度"
          width="160">
        </el-table-column>
        <el-table-column
          prop="machine"
          label="作业机台名称"
          width="160">
        </el-table-column>
        <el-table-column
          prop="cclass"
          label="班次"
          width="160">
        </el-table-column>
        <el-table-column
          prop="namount"
          label="每箱包装数量"
          width="160">
        </el-table-column>
        <el-table-column
          prop="customer"
          label="客户名称"
          width="160">
        </el-table-column>
        <el-table-column
          prop="team"
          label="班组名称"
          width="160">
        </el-table-column>
        <el-table-column
          prop="operator"
          label="操作人员"
          width="160">
        </el-table-column>
        <el-table-column
          label="操作"
          width="130"
          fixed="right">
          <template slot-scope="scope">
            <el-link type="primary" @click="rePrint(scope.row)">补打印</el-link>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="fenye">
      <el-pagination
        style="margin-right: 2px;"
        background
        layout="prev, pager, next"
        :page-size="pageSize"
        @current-change="currentChange"
        :total="pageTotal"
        :current-page.sync="pageNum">
      </el-pagination>
    </div>
  </div>
</template>

<script>
import HttpUtil from '@/utils/HttpUtil'
export default {
  name: "ViewPrintLogList",
  components: {},
  props: [ 'machineName' ],
  data() {
    return {
      tableData: [],
      pageSize: 12,
      pageNum: 1,
      pageTotal: 0,
      idScproduct: '',
      ccodeScproduct: '',
      boxIndex: '',
      tableId: ''
    };
  },
  watch: {},
  computed: {},
  methods: {
    async getOrderListSearch() {
      this.pageNum = 1
      this.tableData = [];
      this.pageTotal = 0;
      const param = {
        id: this.tableId,
        idScproduct: this.idScproduct,
        ccodeScproduct: this.ccodeScproduct,
        iindex: this.boxIndex,
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        machine: this.machineName
      }
      await HttpUtil.post('/order/getOrderListSearch', param).then((res)=> {
        if(res.data.list.length > 0) {
          this.pageTotal = res.data.total;
          this.tableData = res.data.list;
        }
      }).catch((err)=> {
        // 网络异常 稍后再试
        this.$message.error('查询失败！' + err);
      });
    },
    rePrint(obj) {
      if(obj.nweight === 0) {
        obj.nweight = ''
      }
      this.$emit('rePrint', obj);
    },
    async getOrderListSearchParam() {
      const param = {
        id: this.tableId,
        idScproduct: this.idScproduct,
        ccodeScproduct: this.ccodeScproduct,
        iindex: this.boxIndex,
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        machine: this.machineName
      }
      await HttpUtil.post('/order/getOrderListSearch', param).then((res)=> {
        if(res.data.list.length > 0) {
          this.pageTotal = res.data.total;
          this.tableData = res.data.list;
          if(res.data.pages < this.pageNum) {
            this.pageNum = 1
          }
        } else {
          this.pageTotal = 0;
          this.tableData = [];
          this.pageNum = 1
        }
      }).catch((err)=> {
        // 网络异常 稍后再试
        this.$message.error('查询失败！' + err);
      });
    },
    currentChange(pageNum) {
      if(pageNum != undefined) {
        this.pageNum = pageNum
        this.getOrderListSearchParam();
      }
    },
    indexMethod(index) {
      return index + 1;
    }
  },
  created() {
    this.getOrderListSearch();
  },
  mounted() {}
};
</script>
<style lang="less" scoped>
.search {
  height: 43px;
  width: 100%;
  display: flex;
  align-items: center;
  font-size: 14px;
  box-sizing: border-box;
  margin-bottom: 5px;
}
.tableDiv {
  height: calc(100% - 110px);
  width: 100%;
}
.fenye {
  height: 50px;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
}
</style>