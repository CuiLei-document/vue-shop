<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            class="input-with-select"
            clearable
            @clear="getOrderList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getOrderList"
            ></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 列表渲染 -->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.is_send === '1'">已付款</el-tag>
            <el-tag v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"> </el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <template slot-scope="scope">
            {{ scope.row.create_time | getDay }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template>
            <el-button
              type="primary"
              icon="el-icon-edit"
              circle
              @click="showBox"
            ></el-button>
            <el-button
              type="success"
              icon="el-icon-location"
              circle
              @click="showProgressBox"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 修改对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="setOrderVisible"
      width="30%"
      @close="addOrderFormDialog"
    >
      <el-form
        :model="addOrderForm"
        :rules="addOrderFormRules"
        ref="addOrderFormRef"
        label-width="100px"
      >
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            :options="cityDate"
            v-model="addOrderForm.address1"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addOrderForm.address2"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="setOrderVisible = false">取 消</el-button>
        <el-button type="primary" @click="setOrderVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <!-- 物流弹窗 -->
    <el-dialog title="提示" :visible.sync="progressVisible" width="30%">
      <el-timeline :reverse="progressVisible">
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time"
        >
          {{ activity.context }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityDate from './citydata'
export default {
  data() {
    return {
      // 查询参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5,
      },
      // 数据列表
      orderList: [],
      // 总数据条数
      total: 0,
      // 对话框显示
      setOrderVisible: false,
      // form 表单
      addOrderForm: {
        address1: [],
        address2: '',
      },
      addOrderFormRules: {
        address1: [
          { required: true, message: '请选择省市区/县', trigger: 'blur' },
        ],
        address2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' },
        ],
      },
      // 省市区
      cityDate,
      // 物流
      progressVisible: false,
      // 物流信息
      progressInfo: [],
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    // 获取列表数据
    async getOrderList() {
      const { data } = await this.$http.get('orders', {
        params: this.queryInfo,
      })
      if (data.meta.status !== 200) {
        return this.$message.success('获取数据失败')
      }
      this.orderList = data.data.goods
      this.total = data.data.total
    },
    // 分页获取总条数
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    // 分页获取单页
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum
      this.getOrderList()
    },
    // 操作- 修改
    showBox() {
      this.setOrderVisible = true
    },
    // 清空form 表单数据
    addOrderFormDialog() {
      this.$refs.addOrderFormRef.resetFields()
    },
    // 物流
    async showProgressBox() {
      const { data } = await this.$http.get(`/kuaidi/:1106975712662`)
      if (data.meta.status !== 200) {
        return this.$message.error('获取物流信息失败')
      }
      this.progressInfo = data.data
      console.log(this.progressInfo)
      console.log(data)
      this.progressVisible = true
    },
  },
}
</script>