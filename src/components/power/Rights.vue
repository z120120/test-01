<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-table :data="rightsList" border stripe>
        <el-table-column label="#" type="index">
        </el-table-column>
        <el-table-column :label="item.label" :prop="item.prop" v-for="(item,index) in tableHead" :key="index">
          <template slot-scope="scope">
            <span v-html="item.render(scope.row)" v-if="item.render"></span>
            <template v-else-if="item.type=='switch'">
              <el-switch v-model="scope.row[item.prop]" @change="item.handle(scope.row)">
              </el-switch>
            </template>
            <template v-else-if="item.type=='button'">
              <el-button :type="btn.type" size="mini" :icon="btn.icon" plain v-for="(btn,index) in item.btnArr" @click="btn.handle(scope.row.id)"
                :key="index">{{btn.value}}</el-button>
            </template>
            <template v-else>{{scope.row[item.prop]}}</template>
          </template>
        </el-table-column>
      </el-table>

    </el-card>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        rightsList: [],
        tableHead:[
          {
            label:'权限名称',
            prop:'authName'
          },{
            label:'路径',
            prop:'path'
          },{
            label:'权限等级',
            prop:'level',
            render:(row)=>{
              var level,color;
              switch(row.level){
                case '0':level='一级';color="primary";break;
                case '1':level='二级';color="success";break;
                case '2':level='三级';color="warning";break;
              }
              return '<span class="el-tag el-tag--'+color+'" >'+level+'</span>'
            }
          },
        ]
      }
    },
    created() {
      this.getRightsList()
    },
    methods: {
      async getRightsList() {
        const {data:res}=await this.$axios.get('rights/list');
        if(res.meta.status!==200) return this.$message.error("获取权限列表失败")
        this.rightsList=res.data
        console.log(this.rightsList)
      }
    }
  }
</script>
<style>
</style>
