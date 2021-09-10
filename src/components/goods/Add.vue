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
      <!-- 提示 -->
      <el-alert title="添加商品信息" type="info" center show-icon> </el-alert>
      <!-- 步骤 -->
      <el-steps :active="activeIndex - 0" align-center>
        <el-step description="基本信息"></el-step>
        <el-step description="商品参数"></el-step>
        <el-step description="商品属性"></el-step>
        <el-step description="商品图片"></el-step>
        <el-step description="商品内容"></el-step>
        <el-step description="完成"></el-step>
      </el-steps>
      <!-- 侧边栏 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          v-model="activeIndex"
          :tab-position="'left'"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input type="number" v-model="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input type="number" v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input type="number" v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品分类">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="{
                  expandTrigger: 'hover',
                  value: 'cat_id',
                  label: 'cat_name',
                  children: 'children',
                }"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyTableData"
              :key="item.attr_id"
            >
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="text"
                  v-for="(text, index) in item.attr_vals"
                  :key="index"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyTableData"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"> </el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              class="upload-demo"
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headersObj"
              :on-success="uploadSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"> </quill-editor>
            <el-button type="primary" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 预览图片对话框 -->
    <el-dialog
      title="图片预览"
      :visible.sync="previewDialogVisible"
      width="50%"
    >
      <span>
        <img :src="previewPath" alt="" />
      </span>
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  data() {
    return {
      // 步骤显示下标
      activeIndex: '0',
      // form 表单
      addForm: {
        goods_name: '', // 名字
        goods_price: 0, // 价格
        goods_number: 0, // 数量
        goods_weight: 0, // 重量
        goods_cat: [], // 级联菜单
        pics: [], // 图片保存地址
        goods_introduce: '', // 富文本输入
        attrs: [], // 保存动态参数和静态属性
      },
      // form 表单验证
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' },
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' },
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' },
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' },
        ],
      },
      // 商品列表数据
      cateList: [],
      // 商品动态参数数据
      manyTableData: [],
      // 商品静态属性数据
      onlyTableData: [],
      // URL图片地址
      uploadURL: 'https://lianghj.top:8888/api/private/v1/upload',
      // 图片上传请求头 headers
      headersObj: {
        Authorization: window.sessionStorage.getItem('token'),
      },
      // 预览图片地址保存
      previewPath: '',
      // 预览图片弹窗
      previewDialogVisible: false,
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      this.cateList = res.data
      // console.log(this.cateList)
    },
    // 级联选择器
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        return (this.addForm.goods_cat = [])
      }
    },
    // tab切换行为判断
    beforeTabLeave(activeName, oldActoveName) {
      if (oldActoveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品分类')
        return false
      }
    },
    // 切换 tabs 触发事件
    async tabClicked() {
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: 'many',
            },
          }
        )
        if (res.meta.status === 200) {
          res.data.forEach((item) => {
            item.attr_vals =
              item.attr_vals.length !== 0 ? item.attr_vals.split(',') : []
          })
          this.manyTableData = res.data
        } else {
          return this.$message.info('获取失败')
        }
        console.log(res.data)
      } else if (this.activeIndex === '2') {
        // 获取 静态列表数据
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: 'only',
            },
          }
        )
        if (res.meta.status !== 200) {
          // 静态数据
          return this.$message.error('获取数据失败')
        }
        this.onlyTableData = res.data
        console.log(res)
      }
    },
    // 图片预览触发事件
    handlePreview(file) {
      console.log(file)
      this.previewPath = file.response.data.url
      this.previewDialogVisible = true
    },
    // 图片删除触发事件
    handleRemove(file) {
      const filePath = file.response.data.tmp_path
      const i = this.addForm.pics.findIndex((index) => index.pic === filePath)
      this.addForm.pics.splice(i, 1)
    },
    // 图片上传回调
    uploadSuccess(response) {
      // 拼接图片路径
      const picsInfo = {
        pic: response.data.tmp_path,
      }
      // 保存图片信息
      this.addForm.pics.push(picsInfo)
    },
    // 添加商品
    add() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) {
          return this.$message.error('请把商品名称填写完整')
        }
        // 添加数据进行转换格式 深拷贝
        const Form = _.cloneDeep(this.addForm)
        Form.goods_cat = Form.goods_cat.join(',')

        // 处理 动态参数 attrs
        this.manyTableData.forEach((item) => {
          const now = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' '),
          }
          this.addForm.attrs.push(now)
        })
        // 处理静态属性
        this.onlyTableData.forEach((item) => {
          const now = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals,
          }
          this.addForm.attrs.push(now)
        })
        Form.attrs = this.addForm.attrs

        // 添加商品
        const { data } = await this.$http.post('goods', Form)
        if (data.meta.status !== 201) {
          return this.$message.error('添加商品失败')
        }
        this.$message.success('商品添加成功')
        this.getCateList()
        this.$router.push('/goods')
      })
    },
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.el-step__description {
  font-size: 16px;
  margin-top: 10px;
}
.el-checkbox {
  margin-left: 0 !important;
}
.ql-editor {
  min-height: 300px;
}
.el-button {
  margin-top: 20px;
}
</style>