<template>
  <div class="login_container">
    <div class="login_box">
      <div class="avatar_box">
        <img src="~assets/logo.png" alt="" />
      </div>
      <el-form
        :model="loginForm"
        :rules="loginFormRules"
        label-width="0px"
        class="login_form"
        ref="loginFormRef"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            prefix-icon="iconfont icon-user"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            prefix-icon="iconfont icon-3702mima"
          ></el-input>
        </el-form-item>
        <el-form-item class="btns">
          <el-button type="primary" @click="login">提交</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loginForm: {
        username: 'admin',
        password: '123456',
      },
      loginFormRules: {
        username: [
          { required: true, message: '请输入登录用户名', trigger: 'blur' },
          {
            min: 3,
            max: 15,
            message: '用户名长度为 3~15个字符',
            trigger: 'blur',
          },
        ],
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' },
          {
            min: 6,
            max: 12,
            message: '用户名长度为 6~12个字符',
            trigger: 'blur',
          },
        ],
      },
    }
  },
  methods: {
    resetLoginForm() {
      // resetFields 在提交表单时候的 预验证 element 提供的函数
      this.$refs.loginFormRef.resetFields()
    },
    login() {
      // validate 在提交表单时候的 预验证 element 提供的函数
      this.$refs.loginFormRef.validate(async (valid) => {
        if (!valid) return
        let { data: res } = await this.$http.post('login', this.loginForm)
        if (res.meta.status === 200) {
          this.$message.success('登录成功')
          console.log(res)
          window.sessionStorage.setItem('token', res.data.token)
          this.$router.push('/home')
        } else {
          this.$message.error('登录失败')
        }
      })
    },
  },
}
</script>
<style lang="scss" scoped>
.login_container {
  background: rgb(94, 243, 89);
  height: 100%;
  position: relative;
  .login_box {
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 5px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    .avatar_box {
      width: 130px;
      height: 130px;
      border: 1px solid rgb(144, 151, 247);
      border-radius: 50%;
      box-shadow: 0 0 13px rgba(93, 230, 240, 0.5);
      padding: 10px;
      position: absolute;
      right: -65px;
      top: -65px;
      background: rgb(152, 235, 119);
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eee;
      }
    }
    .login_form {
      position: absolute;
      bottom: 0;
      width: 100%;
      padding: 0 10px;
      .btns {
        display: flex;
        justify-content: flex-end;
      }
    }
  }
}
</style>