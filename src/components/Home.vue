<template>
  <el-container class="home_container">
    <el-header>
      <div>
        <img src="~assets/homeLogo.png" alt="" />
        <span>后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出登录</el-button>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div @click="toggleCollapse">|||</div>
        <el-menu
          background-color="#313743"
          text-color="#fff"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath"
        >
          <!-- 一级导航 -->
          <el-submenu
            :index="item.id + ''"
            v-for="item in menuList"
            :key="item.id"
          >
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <span>{{ item.authName }}</span>
            </template>
            <!-- // 二级导航 -->
            <el-menu-item
              :index="'/' + subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveNavPath('/' + subItem.path)"
            >
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      menuList: [],
      iconsObj: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao',
      },
      isCollapse: false,
      activePath: '',
    }
  },
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
      this.$message.success('退出成功')
    },
    async getMenuList() {
      const { data: res } = await this.$http('menus')
      if (res.meta.status === 200) {
        this.menuList = res.data
      } else {
        console.log('获取失败')
      }
    },
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    saveNavPath(activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    },
  },
}
</script>
<style lang="scss" scoped>
// #363d40 header  #313743 aside #e9edf1 main
.home_container {
  height: 100%;
}
.el-header {
  background-color: #363d40;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 12px;
  > div {
    display: flex;
    align-items: center;
    color: white;
    > span {
      margin-left: 12px;
    }
  }
}
.iconfont {
  margin-right: 10px;
}
.el-aside {
  background-color: #313743;
  color: white;
  .el-menu {
    border-right: none;
  }
  > div {
    background-color: #475161;
    height: 24px;
    //   line-height: 24px;
    font-size: 16px;
    text-align: center;
    cursor: pointer;
    letter-spacing: 0.2em;
  }
}
.el-main {
  background-color: #e9edf1;
}
</style>