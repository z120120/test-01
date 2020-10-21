<template>

  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/img/heima.png" alt="">
        <span>电商后台管理平台</span>
        </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse?'64px':'200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-menu :unique-opened="true" :collapse="isCollapse" router :default-active="activePath" :collapse-transition="false" background-color="#333744" text-color="#fff" active-text-color="#409eef">
          <el-submenu :index="item.path" v-for="item in menulist " :key="item.id">
            <template slot="title">
                     <i :class="iconsObj[item.id]"></i>
                     <span>{{item.authName}}</span>
                   </template>
            <el-menu-item  :index="'/'+subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/'+subItem.path)">
              <template slot="title">
                       <i class="el-icon-menu"></i>
                       <span>{{subItem.authName}}</span>
                     </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 内容主体 -->
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
        menulist:[],
        iconsObj:{
          125:'el-icon-s-custom',
          103:'el-icon-setting',
          101:'el-icon-s-shop',
          102:'el-icon-wallet',
          145:'el-icon-data-line'
        },
        isCollapse:false,
        activePath:''

      }
    },
    created() {
      this.getMenuList()
      this.activePath=window.sessionStorage.getItem('activePath')

    },
    
    methods: {
      logout() {
        window.sessionStorage.clear()
        this.$router.push('/login')
      },
      //获取所有的菜单
     async getMenuList(){
       const {data:res}= await this.$axios.get('menus')
       if(res.meta.status!==200) return this.$message.error(res.meta.msg)
       this.menulist=res.data
       console.log(this.menulist)
      },
      toggleCollapse(){
        this.isCollapse=!this.isCollapse
      },
      //保存链接的激活状态
      saveNavState(activePath){
        window.sessionStorage.setItem('activePath',activePath)
        this.activePath=activePath
      }
    }
  }
</script>
<style lang="less" scoped>
  .home-container{
    height:100%;
  }
.el-header{
  background-color: #373D41;
  display:flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 0;
  color:#fff;
  font-size: 20px;
  >div{
    display: flex;
    align-items: center;
    span{
      margin-left: 10px;
    }
  }
}
.el-aside{
  background-color: #333744;
  .el-menu{
    border-right: none;
  }
}
.el-main{
  background-color: #EAEDF1;
}
.toggle-button{
  background-color: #4A5064;
  color: #fff;
  font-size: 10px;
  line-height: 24px;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
  // transform: rotate(90deg);
}
</style>
