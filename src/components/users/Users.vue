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
          <template>
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
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
      <el-dialog title="添加新用户" :visible.sync="addUserVisible" width="30%">
        <!-- 添加用户信息 -->
        <el-form
          :model="addForm"
          status-icon
          :rules="addFormRules"
          ref="addFormRef"
          label-width="70px"
        >
          <el-form-item label="用户名" prop="username">
            <el-input type="text" v-model="addForm.username" ></el-input>
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
          <el-button type="primary" @click="addUserVisible = false"
            >确 定</el-button
          >
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryList: {
        query: '',
        pagenum: 1,
        pagesize: 2,
      },
      usersList: [],
      total: 0,
      addUserVisible: false,
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: '',
      },
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
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
        ],
      },
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
      console.log(res)
      if (res.meta.status === 200) {
        this.usersList = res.data.users
        this.total = res.data.total
      } else {
        console.log('获取失败')
      }
    },
    handleSizeChange(newSize) {
      this.queryList.pagesize = newSize
      this.getUserList()
      console.log(newSize)
    },
    handleCurrentChange(newNum) {
      this.queryList.pagenum = newNum
      this.getUserList()
    },
    async usersStateChanged(scope) {
      console.log(scope)
      const { data: res } = await this.$http.put(
        `users/${scope.id}/state/${scope.mg_state}`
      )
      console.log(res)
      if (res.meta.status === 200) {
        this.$message.success('修改成功')
      } else {
        this.$message.error('修改失败')
        scope.mg_state = !scope.mg_state
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.el-row {
  margin-top: 10px;
}
.el-table {
  margin-top: 20px;
  font-size: 14px;
}
.el-pagination {
  margin-top: 10px;
}
</style>