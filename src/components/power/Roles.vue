<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRolesVisible = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>
      <!-- 角色列表 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['borBot', index === 0 ? 'borTop' : '', 'vertical']"
              v-for="(list, index) in scope.row.children"
              :key="list.id"
            >
              <!-- 一级循环 -->
              <el-col :span="5">
                <el-tag closable @close="removeClose(scope.row, list.id)">
                  {{ list.authName }}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级循环 -->
              <el-col :span="19">
                <el-row
                  :class="[index !== 0 ? 'borTop' : '']"
                  v-for="(list2, index) in list.children"
                  :key="list2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeClose(scope.row, list2.id)"
                    >
                      {{ list2.authName }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- 三级权限 -->
                    <el-tag
                      type="warning"
                      v-for="(list3, index) in list2.children"
                      :key="index"
                      closable
                      @close="removeClose(scope.row, list3.id)"
                    >
                      {{ list3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引区域 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <div>
              <el-button
                size="mini"
                type="primary"
                icon="el-icon-edit"
                @click="editRoles(scope.row.id)"
                >编辑</el-button
              >
              <el-button
                size="mini"
                type="danger"
                icon="el-icon-delete"
                @click="removeRolesById(scope.row.id)"
                >删除</el-button
              >
              <el-button
                size="mini"
                type="warning"
                icon="el-icon-setting"
                @click="showSetRightDialog(scope.row)"
                >分配权限</el-button
              >
            </div>
          </template>
        </el-table-column>
      </el-table>
      <!-- 添加角色弹窗 -->
      <el-dialog
        title="添加角色"
        :visible.sync="addRolesVisible"
        width="30%"
        @close="closeDialogForm"
      >
        <el-form
          :model="rolesForm"
          status-icon
          :rules="addFormRules"
          ref="rolesFormRef"
          label-width="80px"
        >
          <el-form-item label="角色名称" prop="roleName">
            <el-input type="text" v-model="rolesForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述">
            <el-input type="textarea" v-model="rolesForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addRolesVisible = false">取 消</el-button>
          <el-button type="primary" @click="addRoles">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改用户 id -->
      <el-dialog
        title="提示"
        :visible.sync="editDialogVisible"
        width="30%"
        @close="setRightDialogClosed"
      >
        <el-form
          :model="editForm"
          status-icon
          :rules="editFormRules"
          ref="editFormRef"
          label-width="80px"
        >
          <el-form-item label="角色名称" prop="roleName">
            <el-input type="text" v-model="editForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述">
            <el-input type="textarea" v-model="editForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editRolesForm">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改用户权限弹窗 -->
      <el-dialog
        title="修改权限"
        :visible.sync="showSetRightDialogVisible"
        width="40%"
      >
        <el-tree
          :data="rightList"
          :props="rightProps"
          show-checkbox
          node-key="id"
          default-expand-all
          :default-checked-keys="defKeys"
          ref="treeRef"
        ></el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click="showSetRightDialogVisible = false"
            >取 消</el-button
          >
          <el-button type="primary" @click="getRight">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolesList: [],
      addRolesVisible: false, // 添加用户输入框
      editDialogVisible: false, // 修改用户输入框
      showSetRightDialogVisible: false, // 修改权限弹窗
      rolesForm: {
        // 获取所有数据
        roleName: '',
        roleDesc: '',
      },
      rightList: [], // 权限数据
      rightProps: {
        // 树形结构
        children: 'children',
        label: 'authName',
      },
      defKeys: [], // 获取所有数据的key
      editForm: {}, // 用户数据
      rightId: '',
      addFormRules: {
        roleName: [{ required: true, message: '请输入名称', trigger: 'blur' }],
      },
      editFormRules: {
        roleName: [{ required: true, message: '请输入名称', trigger: 'blur' }],
      },
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (!res.meta.status === 200) {
        return this.$message.error('获取失败')
      }
      this.rolesList = res.data
    },
    // 清空dialog 对话框 form内容
    closeDialogForm() {
      this.$refs.rolesFormRef.resetFields()
    },
    // 添加新用户
    addRoles() {
      this.$refs.rolesFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post('roles', this.rolesForm)
        if (res.meta.status === 201) {
          this.$message.success('添加成功')
          this.addRolesVisible = false
          this.getRolesList()
        } else {
          return this.$message.error('添加失败')
        }
      })
    },
    // 获取用户 ID
    async editRoles(id) {
      const { data: res } = await this.$http.get(`roles/${id}`)
      if (res.meta.status === 200) {
        this.editForm = res.data
      } else {
        return this.$message.error('获取失败')
      }
      this.editDialogVisible = true
    },
    // 修改用户
    editRolesForm() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error('请检查角色名称')
        const { data: res } = await this.$http.put(
          `roles/${this.editForm.roleId}`,
          {
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc,
          }
        )
        if (res.meta.status === 200) {
          this.$message.success('修改成功')
          this.getRolesList()
          this.editDialogVisible = false
        } else {
          return this.$message.error('修改失败')
        }
      })
    },
    // 删除用户
    async removeRolesById(id) {
      const result = await this.$confirm(
        '此操作将永久删除该角色, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      // confirm 返回值为 确定
      // cancel 返回值 为 取消
      if (result === 'confirm') {
        const { data: res } = await this.$http.delete(`roles/${id}`)
        if (res.meta.status === 200) {
          this.$message.success('删除成功')
          this.getRolesList()
          this.editDialogVisible = false
        } else {
          return this.$message.error('删除失败')
        }
      } else {
        return this.$message.info('取消删除角色')
      }
    },
    // 删除三级权限图标
    async removeClose(roles, rightId) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消删除')
      }
      const { data: res } = await this.$http.delete(
        `roles/${roles.id}/rights/${rightId}`
      )
      if (res.meta.status === 200) {
        this.$message.success('删除成功')
        roles.children = res.data
      } else {
        return this.$message.error('删除失败')
      }
    },
    // 展示权限弹窗
    async showSetRightDialog(scope) {
      this.rightId = scope.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status === 200) {
        this.rightList = res.data
      } else {
        return this.$message.error('获取失败')
      }
      // 递归获取三级节点
      this.getLeafKeys(scope, this.defKeys)
      this.showSetRightDialogVisible = true
    },
    // 递归获取三级节点
    getLeafKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach((item) => this.getLeafKeys(item, arr))
    },
    // 关闭对话框清除之前保存的数据
    setRightDialogClosed() {
      this.defKeys = []
    },
    // 获取所有选中节点ID 发送请求
    async getRight() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(
        `roles/${this.rightId}/rights`,
        {
          rids: idStr,
        }
      )
      if (res.meta.status === 200) {
        this.$message.success('分配成功')
        this.getRolesList()
        this.showSetRightDialogVisible = false
      } else {
        return this.$message.error('分配权限失败')
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.el-tag {
  margin: 7px;
}
.borTop {
  border-top: 1px solid #eee;
}
.borBot {
  border-bottom: 1px solid #eee;
}
.vertical {
  display: flex;
  align-items: center;
}
</style>