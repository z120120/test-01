<template>
  <div class="login_container">
    <div class="login_box">
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="">
      </div>
      <el-form ref="loginFormRef" :model="loginForm" class="login_form" :rules="loginFormRules">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" prefix-icon="iconfont icon-pwd" type="password"></el-input>
        </el-form-item>
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
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
        //登录表单的数据绑定对象
        loginForm: {
          username: '',
          password: ''
        },
        //登录表单的验证规则对象
        loginFormRules: {
          username: [{
            required: true,
            message: "请输入登录用户名",
            trigger: "blur"
          }, {
            min: 3,
            max: 10,
            message: "长度在3到10个字符之间",
            trigger: "blur"
          }, ],
          password: [{
            required: true,
            message: "请输入登录密码",
            trigger: "blur"
          }, {
            min: 6,
            max: 15,
            message: "长度在6到15个字符之间",
            trigger: "blur"
          }, ],
        }
      }
    },
    methods: {
      login() {
        this.$refs.loginFormRef.validate(async valid => {
          if (!valid) return;
          const {data: res} = await this.$axios.post('login', this.loginForm)
          //登录失败
          if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
          //登陆成功
          this.$message.success(res.meta.msg);
          //设置token到sessionStorage
          window.sessionStorage.setItem('token',res.data.token)
          //跳转到主页
          this.$router.push('/home')
        });
      },
      resetLoginForm() {
        this.$refs.loginFormRef.resetFields()
      }
      //看到第一天第20节课程
    }
  }
</script>
<style lang="less" scoped>
  .login_container {
    height: 100%;
    background-color: #2b4b6b;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .login_box {
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    position: relative;

    .avatar_box {
      width: 100px;
      height: 100px;
      border: 1px solid #eee;
      border-radius: 50%;
      padding: 10px;
      box-shadow: 0 0 10px #ddd;
      background-color: #fff;
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);

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
      box-sizing: border-box;
      padding: 0 20px;
    }

    .btns {
      display: flex;
      justify-content: flex-end;
    }
  }
</style>
