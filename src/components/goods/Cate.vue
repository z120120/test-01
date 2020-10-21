<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row class="mb20">
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <tree-table :data="catelist" :columns="columns" :selection-type="false" :expand-type="false" :show-index="true" index-text="#" border :show-row-hover="false">
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted===false" style="color:lightgreen"></i>
          <i class="el-icon-error" v-else style="color: red;"></i>
        </template>
        <template  slot="order" slot-scope="scope">
          <el-tag type="primary" size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag type="success" size="mini"  v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag type="warning" size="mini"  v-else-if="scope.row.cat_level===2">三级</el-tag>
        </template>
        <template  slot="handle" slot-scope="scope">
          <el-button type="primary" plain size="mini" icon="el-icon-edit" @click="edit(scope.row)">编辑</el-button>
          <el-button type="warning" plain size="mini" icon="el-icon-delete"  @click="delete(scope.row)">删除</el-button>
            </template>
      </tree-table>
      <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[10, 20, 30, 40]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
          </el-pagination>
    </el-card>
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%" @close="addCateDialogClosed"
   >
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px" >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
<el-form-item label="父级分类" >
          <el-cascader :options="parentcatelist" :props="cascaderProps" v-model="selectedKeys" @change="parentCateChanged"
        clearable @expand-change="elCascaderOnlick" @visible-change="elCascaderOnlick"></el-cascader>
        </el-form-item>
        </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
  export default {
    created() {
      this.getCateList()
    },
    data() {
      return {
        //查询条件
        queryInfo: {
          type: 3,
          pagenum: 1,
          pagesize: 10
        },
        //分类列表
        catelist: [],
        //分页数据总条数
        total: 0,
        columns:[
          {
            label:'分类名称',
            prop:'cat_name'
          },{
            label:'是否有效',
            type:'template',
            template:'isok'
          },{
            label:'排序',
            type:'template',
            template:'order'
          },{
            label:'操作',
            type:'template',
            template:'handle'
          },
        ],
        addCateDialogVisible:false,
        addCateForm:{
          cat_name:'',
          cat_level:0,
          cat_pid:0

        },
        addCateFormRules:{
          cat_name:[
             { required: true, message: '请输入分类名称', trigger: 'blur' },
          ]
        },
        options:[

        ],
        parentcatelist:[],
        cascaderProps:{
          value:'cat_id',
          label:'cat_name',
            checkStrictly:true
        },
        // 选中的父级分类的id数组
        selectedKeys:[],


      }
    },
    methods: {
      async getCateList() {
        const {
          data: res
        } = await this.$axios.get('categories', {
          params: this.queryInfo
        });
        if (res.meta.status !== 200) return this.$message.error("获取商品分类失败！");
        this.catelist = res.data.result;
        this.total = res.data.total;
      },
      edit(row){
console.log(row)
      },
      delete(row){
console.log(row)
      },
      handleSizeChange(newSize){
        this.queryInfo.pagesize=newSize
        this.getCateList()
      },
      handleCurrentChange(newPage){
        this.queryInfo.pagenum=newPage

        this.getCateList()
      },
      showAddCateDialog(){
        this.getParentCateList()
        console.log(this.parentcatelist)
        this.addCateDialogVisible=true
      },
      async getParentCateList(){
        const {
          data: res
        } = await this.$axios.get('categories', {
          params: {type:2}
        });
        if (res.meta.status !== 200) return this.$message.error("获取父级分类失败！");
        this.parentcatelist = res.data;
      },
      parentCateChanged(){
        if(this.selectedKeys.length>0){
          this.addCateForm.cat_pid=this.selectedKeys[this.selectedKeys.length-1]
          this.addCateForm.cat_level=this.selectedKeys.length
          return
        }else{
          this.addCateForm.cat_pid=0;
          this.addCateForm.cat_level=0;
        }
      },
      elCascaderOnlick(){
        setTimeout(()=>{
          document.querySelectorAll(".el-cascader-node__label").forEach(el => {
        　　　　　　el.onclick = function() {
        　　　　　　　　if (this.previousElementSibling) this.previousElementSibling.click();
        　　　　　　};
        　　　　});
        });
      },
      addCate(){
       const validResults= this.$refs.addCateFormRef.validate(async valid=>{
         if(!valid) return;
         const {data:res}=await this.$axios.post('categories',this.addCateForm)
         if(res.meta.status!==201) return this.$message.error("添加分类失败！")
         this.$message.success("添加分类成功！")
         this.getCateList()
         this.addCateDialogVisible=false
       })

        console.log(validResults)
      },
      addCateDialogClosed(){
        this.$refs.addCateFormRef.resetFields()
        this.selectedKeys=[]
      }

    },

    mounted() {
    　　//点击文本就让它自动点击前面的input就可以触发选择。但是因组件阻止了冒泡，暂时想不到好方法来触发。
    　　//这种比较耗性能，暂时想不到其他的，能实现效果了。

    　　
    },
  }
</script>
<style lang="less">
  .el-cascader{
    width:100%;

  }
.el-cascader-node>.el-radio,.el-radio:last-child{
  visibility: hidden;
      width: 0px;
}

</style>
