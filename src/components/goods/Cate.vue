<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 添加用户 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 列表渲染 -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-circle-check"
            v-if="scope.row.cat_deleted !== false"
            style="color: red"
          ></i>
          <i v-else class="el-icon-circle-check" style="color: lightgreen"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>

          <el-tag
            size="mini"
            type="success"
            v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >

          <el-tag v-else size="mini" type="warning">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="btn">
          <el-button size="mini" type="primary">编辑</el-button>
          <el-button size="mini" type="warning">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页展示 -->
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

      <!-- 添加分类对话框 -->
      <el-dialog
        title="添加分类"
        :visible.sync="addCateDialogVisible"
        width="40%"
        ref="addCateRef"
        @close="addCateDialogClose"
      >
        <el-form
          :model="addCateForm"
          :rules="addCateFormRules"
          ref="addCateFormRef"
          label-width="100px"
          class="demo-ruleForm"
        >
          <el-form-item label="分类名称：" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类：">
            <el-cascader
              v-model="selectedKeys"
              :options="parentCateList"
              expand-trigger="hover"
              :props="cascaderPros"
              @change="parentChanged"
              :clearable="true"
              :change-on-select="true"
            ></el-cascader>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addCateDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addCate">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询数据参数
      queryInfo: {
        pagenum: 1,
        pagesize: 5,
      },
      // 数据列表
      cateList: [],
      // 总数据条数
      total: 0,
      // 展示  tree-table 模板 columns
      columns: [
        { label: '分类名称', prop: 'cat_name' },
        { label: '是否有效', type: 'template', template: 'isok' },
        { label: '排序', type: 'template', template: 'order' },
        { label: '操作', type: 'template', template: 'btn' },
      ],
      // 对话框
      addCateDialogVisible: false,
      // 获取分类的model
      addCateForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0,
      },
      addCateFormRules: {
        cat_name: [
          { required: true, message: '名字不能为空', trigger: 'blur' },
        ],
      },
      // 父级分类数据
      parentCateList: [],
      // 配置 联级选择器 显示
      cascaderPros: {
        value: 'cat_pid',
        label: 'cat_name',
        children: 'children',
      },
      // 双向绑定数据显示
      selectedKeys: [],
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取数据列表 条数
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo,
      })
      if (res.meta.status === 200) {
        this.cateList = res.data.result
        this.total = res.data.total
      } else {
        return this.$message.success('获取数据失败')
      }
    },
    // 获取分页总条数数据
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 获取当前页数据
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 对话框展示
    addCateDialog() {
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 获取父级分类数据
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 },
      })
      console.log(res)
      if (res.meta.status === 200) {
        this.parentCateList = res.data
      } else {
        return this.$message.error('获取失败')
      }
    },
    // cascader 更新数据
    parentChanged() {
      //   当用户选择到 ID 的值就会变化
      let idKeys = this.selectedKeys
      if (idKeys.length > 0) {
        this.addCateForm.cat_pid = idKeys[idKeys.length - 1]

        this.addCateForm.cat_level = idKeys.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
      console.log(this.selectedKeys)
    },
    // 添加分类
    addCate() {
        console.log(this.addCateForm)
      //   this.$refs.addCateFormRef.validate(async (valid) => {
      //     if (!valid) return this.$message.error('不能为空')
      //     const { data: res } = await this.$http.post(
      //       'categories',
      //       this.addCateForm
      //     )
      //     console.log(res)
      //     if (res.meta.status !== 201) {
      //       return this.$message.error('添加失败')
      //     }
      //     this.getCateList()
      //     this.addCateDialogVisible = false
      //   })
    },
    // 清空添加分类对话框数据
    addCateDialogClose() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
  },
}
</script>