<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 警告 -->
      <el-alert
        show-icon
        :closable="false"
        title="注意：只允许第三级分类设置相关参数"
        type="warning"
      >
      </el-alert>
      <span class="commodity">选择商品分类</span>
      <!-- 选择菜单 -->
      <el-cascader
        v-model="selectedCateKeys"
        :options="cateList"
        expand-trigger="hover"
        :props="cateListProps"
        @change="handleChange"
      ></el-cascader>
      <!-- 切换选择 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button
            :disabled="isBtnDisabled"
            type="primary"
            @click="addDialogVisible = true"
            >添加参数</el-button
          >
          <el-table :data="manyTabData" border stripe>
            <!-- 动态属性分类 -->
            <el-table-column type="expand">
              <!-- 展开标签 -->
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  @close="handleClose(index, scope.row)"
                  >{{ item }}</el-tag
                >
                <!-- 动态输入框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引下标 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column
              label="动态参数"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditVisible(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button
            :disabled="isBtnDisabled"
            type="primary"
            @click="addDialogVisible = true"
            >添加属性</el-button
          >
          <el-table :data="onlyTabData" border stripe>
            <!-- 静态属性分类 -->
            <el-table-column type="expand">
              <!-- 展开标签 -->
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  @close="handleClose(index, scope.row)"
                  >{{ item }}</el-tag
                >
                <!-- 动态输入框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column
              label="静态参数"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditVisible"
                  >编辑</el-button
                >
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加对话框 -->
    <el-dialog
      :title="'添加' + textTitle"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClose"
    >
      <el-form
        ref="addFormRef"
        :model="addForm"
        label-width="80px"
        :rules="addFormRules"
      >
        <el-form-item :label="textTitle" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑对话框 -->
    <el-dialog
      :title="'编辑' + textTitle"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClose"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        label-width="80px"
        :rules="editFormRules"
      >
        <el-form-item :label="textTitle" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cateList: [], // 获取列表数据
      cateListProps: {
        // 数据默认项
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
      },
      selectedCateKeys: [], // 保存输出的结果
      activeName: 'many', // 默认标签选择
      // 动态数据
      manyTabData: [],
      // 静态数据
      onlyTabData: [],
      // 显示对话框
      addDialogVisible: false,
      // 对话框表单
      addForm: {
        attr_name: '',
      },
      // 表单验证
      addFormRules: {
        attr_name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
      },
      // 编辑对话框显示
      editDialogVisible: false,
      // 编辑对话框表单
      editForm: {
        attr_name: '',
      },
      // edit 表单验证
      editFormRules: {
        attr_name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
      },
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取列表数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取数据失败')
      }

      this.cateList = res.data
    },
    // 监听级联菜单
    handleChange() {
      // 如果选择的不是三级分类 默认清空
      this.getParamsData()
    },
    // 监听标签切换
    handleTabClick() {
      this.getParamsData()
    },
    // 获取 动态和静态参数
    async getParamsData() {
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTabData = []
        this.onlyTabData = []
        return
      }

      // 根据ID 获取数据
      const { data } = await this.$http.get(
        `categories/${this.caseaId}/attributes`,
        {
          params: { sel: this.activeName },
        }
      )

      if (data.meta.status !== 200) {
        return this.$message.error('获取数据失败')
      }

      data.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        // 动态输入框展示
        item.inputVisible = false
        // 动态输入框input
        item.inputValue = ''
      })
      console.log(data.data)

      if (this.activeName === 'many') {
        this.manyTabData = data.data
      } else {
        this.onlyTabData = data.data
      }
    },
    // 清空dialog 表单内容
    addDialogClose() {
      this.$refs.addFormRef.resetFields()
    },
    // 添加数据
    addParams() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) {
          return this.$message.error('请检查表单')
        }

        const { data: res } = await this.$http.post(
          `categories/${this.caseaId}/attributes`,
          {
            attr_sel: this.activeName,
            attr_name: this.addForm.attr_name,
          }
        )
        console.log(res)
        if (res.meta.status === 201) {
          this.$message.success('添加成功')
          this.addDialogVisible = false
          this.getParamsData()
        } else {
          return this.$message.error('添加失败')
        }
      })
    },
    // 清空 dialog 表单
    editDialogClose() {
      this.$refs.editFormRef.resetFields()
    },
    // 确定 edit 表单
    editParams() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          `categories/${this.caseaId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName,
          }
        )
        if (res.meta.status === 200) {
          this.$message.success('修改成功')
          this.getParamsData()
          this.editDialogVisible = false
        } else {
          return this.$message.error('修改失败')
        }
      })
    },
    // 弹出 edit 表单
    async showEditVisible(attr_id) {
      const { data: res } = await this.$http.get(
        `categories/${this.caseaId}/attributes/${attr_id}`,
        {
          params: {
            attr_sel: this.activeName,
          },
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取失败')
      }

      this.editForm = res.data
      console.log(res)
      this.editDialogVisible = true
    },
    // 删除对应的数据
    async removeParams(attr_id) {
      const confirm = await this.$confirm(
        '此操作将永久删除该参数, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      // confirm 确定删除
      if (confirm !== 'confirm') {
        return this.$message.info('取消删除')
      }
      const { data: res } = await this.$http.delete(
        `categories/${this.caseaId}/attributes/${attr_id}`
      )
      if (res.meta.status === 200) {
        this.$message.success('删除成功')
        this.getParamsData()
      } else {
        return this.$message.error('删除失败')
      }
    },
    // 动态输入 事件
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = !row.inputVisible
        return
      }

      //保存数据 生产tag
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false

      // 保存数据
      this.saveAttrParams(row)
    },
    // 显示输入框
    showInput(row) {
      row.inputVisible = true
      // 获取元素 添加 焦点
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 保存数据 tag 标签
    async saveAttrParams(row) {
      // 保存数据
      const { data: res } = await this.$http.put(
        `categories/${this.caseaId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' '),
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('失败')
      }

      this.$message.success('成功')
    },
    // 删除tag 标签
    handleClose(index, row) {
      row.attr_vals.splice(index, 1)
      this.saveAttrParams(row)
    },
  },
  computed: {
    // 动态显示 添加按钮
    isBtnDisabled() {
      return this.selectedCateKeys.length !== 3 ? true : false
    },
    // 获取最后参数的ID
    caseaId() {
      let keysId = this.selectedCateKeys
      return keysId.length === 3 ? keysId[2] : null
    },
    // 判断对话框
    textTitle() {
      return this.activeName === 'many' ? '动态参数' : '静态属性'
    },
  },
}
</script>
<style lang="scss" scoped>
.el-alert {
  margin-bottom: 15px;
}
.commodity {
  font-size: 20px;
}
.el-tag {
  margin: 8px 10px 0 6px;
}
.input-new-tag {
  width: 120px;
}
</style>