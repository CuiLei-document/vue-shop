<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- layout 布局 -->
      <el-row :gutter="16">
        <el-col :span="8">
          <el-input v-model="queryList.query" clearable @clear="getUserList">
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="addUserVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>
      <!-- table 表格渲染 -->
      <el-table :data="usersList" stripe border>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态" prop="mg_state">
          <template slot-scope="scope">
            <!-- Switch v-mode 通过获取 插槽来获取数据 scope.row 全部数据 -->
            <el-switch
              v-model="scope.row.mg_state"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="usersStateChanged(scope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <!-- 用户列表渲染区域 -->
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editUser(scope.row.id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>

            <!-- 文字提示信息 -->
            <el-tooltip
              effect="dark"
              content="修改角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRoles(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页显示区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryList.pagenum"
        :page-sizes="[1, 5, 10, 20]"
        :page-size="queryList.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>

      <!-- 对话框区域 -->
      <el-dialog
        title="添加新用户"
        :visible.sync="addUserVisible"
        width="30%"
        @close="closeDialogForm"
      >
        <!-- 添加用户信息 -->
        <el-form
          :model="addForm"
          status-icon
          :rules="addFormRules"
          ref="addFormRef"
          label-width="70px"
        >
          <el-form-item label="用户名" prop="username">
            <el-input type="text" v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input type="password" v-model="addForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input type="text" v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input type="text" v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addUserVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改用户信息 -->
      <el-dialog title="修改" :visible.sync="editDialogVisible" width="30%">
        <el-form
          :model="editForm"
          status-icon
          :rules="editFormRules"
          ref="editFormRef"
          label-width="70px"
          @close="editDialogClosed"
        >
          <el-form-item label="用户名">
            <el-input
              type="text"
              v-model="editForm.username"
              disabled
            ></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="emil">
            <el-input type="text" v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input type="text" v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUserForm">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改分配脚色对话框 -->

      <el-dialog
        title="分配角色"
        :visible.sync="rolesDialogVisible"
        width="30%"
        @close="closeRoleDialog"
      >
        <div>
          <p>当前用户姓名： {{ userInfo.username }}</p>
          <p>当前用户角色： {{ userInfo.role_name }}</p>
          <p>
            当前选中的：
            <el-select v-model="selectedRoleId" placeholder="请选择">
              <el-option
                v-for="item in rolesList"
                :key="item.id"
                :label="item.roleName"
                :value="item.id"
              >
              </el-option>
            </el-select>
          </p>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="rolesDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    // 邮箱验证
    let checkEmail = (rule, value, callback) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        callback()
      } else {
        callback(new Error('请输入正确的邮箱'))
      }
    }
    // 手机验证
    let checkMobile = (rule, value, callback) => {
      const regMobile =
        /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        callback()
      } else {
        callback(new Error('请输入正确的手机号码'))
      }
    }
    return {
      // 获取用户列表的参数对象
      queryList: {
        query: '',
        pagenum: 1,
        pagesize: 2,
      },
      usersList: [],
      total: 0,
      // 添加用户对话框
      addUserVisible: false,
      // 添加用户数据表单
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: '',
      },
      editDialogVisible: false,
      editForm: {},
      // 验证表单规则
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 15, message: '请输入3-15位用户名', trigger: 'blur' },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 12, message: '请输入6-12位密码', trigger: 'blur' },
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          {
            validator: checkEmail,
            trigger: 'blur',
          },
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' },
        ],
      },
      // 验证添加用户表单
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' },
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' },
        ],
      },
      rolesDialogVisible: false, // 权限对话框
      // 获取所有对象
      userInfo: {},
      // 所有的数据列表
      rolesList: [],
      // 当前选中的角色
      selectedRoleId: '',
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryList,
      })
      if (res.meta.status === 200) {
        this.usersList = res.data.users
        this.total = res.data.total
      } else {
        console.log('获取失败')
      }
    },
    // 总条数数据
    handleSizeChange(newSize) {
      this.queryList.pagesize = newSize
      this.getUserList()
    },
    // 点击页数获取数据
    handleCurrentChange(newNum) {
      this.queryList.pagenum = newNum
      this.getUserList()
    },
    // 获取数据操作数据的状态
    async usersStateChanged(scope) {
      const { data: res } = await this.$http.put(
        `users/${scope.id}/state/${scope.mg_state}`
      )
      if (res.meta.status === 200) {
        this.$message.success('修改成功')
      } else {
        this.$message.error('修改失败')
        scope.mg_state = !scope.mg_state
      }
    },
    // 关闭对话框清空表单内容
    closeDialogForm() {
      this.$refs.addFormRef.resetFields()
    },
    // 对表单预验证
    addUser() {
      this.$refs.addFormRef.validate(async (value) => {
        if (value) {
          const { data: res } = await this.$http.post('users', this.addForm)
          this.addUserVisible = false
          this.getUserList()
        } else {
          this.$message.error('您输入的内容不完整')
        }
      })
    },
    // 查询用户信息
    async editUser(id) {
      const { data: res } = await this.$http.get(`users/${id}`)
      if (res.meta.status === 200) {
        this.editForm = res.data
      } else {
        return this.$message.error('查询用户数据失败')
      }
      this.editDialogVisible = true
    },
    // 清空对话框内容
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 修改用户信息
    editUserForm() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return

        // 修改用户信息
        const { data: res } = await this.$http.put(
          `users/${this.editForm.id}`,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile,
          }
        )
        if (res.meta.status === 200) {
          this.$message.success('修改成功')
          this.getUserList()
          this.editDialogVisible = false
        } else {
          return this.$message.error('修改失败')
        }
      })
    },
    // 根据ID 删除用户信息
    async removeUserById(id) {
      const res = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      // 点击确定 返回的是 confirm
      // 点击取消 返回的是 cancel
      if (res === 'confirm') {
        const { data: res } = await this.$http.delete(`users/${id}`)
        if (res.meta.status === 200) {
          this.$message.success('删除成功')
          this.getUserList()
        } else {
          return this.$message.error('删除失败')
        }
      } else {
        return this.$message.info('取消删除用户')
      }
    },
    // 展示修改角色对话框
    async setRoles(userInfo) {
      // 保存所有对象信息
      this.userInfo = userInfo
      const { data: res } = await this.$http.get('roles')
      this.rolesList = res.data

      this.rolesDialogVisible = true
    },
    // 分配用户角色
    async saveRoleInfo() {
      if (!this.selectedRoleId) {
        return this.$message.error('分配角色失败')
      }

      const { data: res } = await this.$http.put(
        `users/${this.userInfo.id}/role`,
        {
          rid: this.selectedRoleId,
        }
      )
      if (res.meta.status === 200) {
        this.$message.success('分配角色成功')
        this.getUserList()
        this.rolesDialogVisible = false
      }
    },
    // 清除分配角色选中状态
    closeRoleDialog() {
      this.selectedRoleId = ''
      this.userInfo = {}
    },
  },
}
</script>
<style lang="scss" scoped>
</style>