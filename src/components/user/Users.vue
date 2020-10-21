<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
        </el-col>
      </el-row>
      <el-table :data="userlist" border stripe>
        <el-table-column label="#" type="index">
        </el-table-column>
        <el-table-column :label="item.label" :prop="item.prop" v-for="(item,index) in tableHead" :key="index" :width="item.width?item.width:''">
          <template slot-scope="scope">
            <span v-html="item.render(scope.row)" v-if="item.render"></span>
            <template v-else-if="item.type=='switch'">
              <el-switch v-model="scope.row[item.prop]" @change="item.handle(scope.row)">
              </el-switch>
            </template>
            <template v-else-if="item.type=='button'">
              <el-button :type="btn.type" size="mini" :icon="btn.icon" plain v-for="(btn,index) in item.btnArr" @click="btn.handle(scope.row.id,scope.row)"
                :key="index">{{btn.value}}</el-button>
            </template>
            <template v-else>{{scope.row[item.prop]}}</template>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination

        layout="total,sizes,prev, pager, next" @size-change="handleSizeChange"
      @current-change="handleCurrentChange" :current-page.sync="queryInfo.pagenum"
        :total="total" :page-size="queryInfo.pagesize" :page-sizes="[1, 2, 5, 10]" >
      </el-pagination>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%" @close="addDiglogClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username" >
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="50%" @close="editDiglogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名" >
          <el-input v-model="editForm.username" :disabled="true"></el-input>
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      width="50%" @close="setRoleDialogClosed">
      <div>
        <p>当前的用户：{{userInfo.username}}</p>
        <p>当前的角色：{{userInfo.role_name}}</p>
        <p>分配新角色：<el-select v-model="selectedRoleId" placeholder="请选择新角色">
    <el-option
      v-for="item in roleList"
      :key="item.id"
      :label="item.roleName"
      :value="item.id">
    </el-option>
  </el-select>
  </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
  export default {
    created() {
      this.getUserList()
    },
    data() {
      var checkEmail=(rule,val,cb)=>{
        let reg=/^[0-9a-zA-Z_.-]+[@][0-9a-zA-Z_.-]+([.][a-zA-Z]+){1,2}$/;
        if(reg.test(val)) return cb();
        return cb(new Error("请输入合法邮箱！"));
      }
      var checkMobile=(rule,val,cb)=>{
        let reg=/^((13[0-9])|(17[0-1,6-8])|(15[^4,\\D])|(18[0-9]))\d{8}$/;
        if(reg.test(val)) return cb();
        return cb(new Error("请输入合法手机号！"));
        }

      return {
        //获取用户列表参数对象
        queryInfo: {
          query: '',
          pagenum: 1,
          pagesize: 10
        },
        userlist: [],
        total: 0,
        tableHead: [{
          label: '姓名',
          prop: 'username'
        }, {
          label: '邮箱',
          prop: 'email'
        }, {
          label: '电话',
          prop: 'mobile'
        }, {
          label: '角色',
          prop: 'role_name'
        }, {
          label: '状态',
          prop: 'mg_state',
          type: 'switch',
          handle:this.userStateChanged
        }, {
          label: '操作',
          type: 'button',
          width:'300px',
          btnArr: [{
            type: 'primary',
            value: '编辑',
            icon:'el-icon-edit',
            handle: this.editDialogShow
          }, {
            type: 'danger',
            value: '删除',
            icon:'el-icon-delete',
            handle: this.removeUserById
          },{
            type: 'warning',
            value: '分配角色',
            icon:'el-icon-setting',
            handle: this.setRole
          }, ]
        }, ],
        addDialogVisible:false,
        addForm:{
          username:'',
          password:'',
          email:'',
          mobile:''
        },
        addFormRules:{
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
          email: [{
            required: true,
            message: "请输入邮箱",
            trigger: "blur"
          }, {
            validator:checkEmail,
            trigger: "blur"
          }, ],
          mobile: [{
            required: true,
            message: "请输入手机号",
            trigger: "blur"
          }, {
            validator:checkMobile,
            trigger: "blur"
          }, ],

        },
        editFormRules:{

          email: [{
            required: true,
            message: "请输入邮箱",
            trigger: "blur"
          }, {
            validator:checkEmail,
            trigger: "blur"
          }, ],
          mobile: [{
            required: true,
            message: "请输入手机号",
            trigger: "blur"
          }, {
            validator:checkMobile,
            trigger: "blur"
          }, ],


        },
        editDialogVisible:false,
        editForm:{

        },
        setRoleDialogVisible:false,
        userInfo:{},
        roleList:[],
        selectedRoleId:'',

      }
    },
    methods: {
      async getUserList() {
        const {
          data: res
        } = await this.$axios.get('users', {
          params: this.queryInfo
        });
        if (res.meta.status !== 200) return this.$message.error("获取用户列表失败！");
        this.userlist = res.data.users;
        this.total = res.data.total;

      },
      async editDialogShow(id) {
        this.editDialogVisible=true;
        const {data:res}= await this.$axios.get('users/'+id);
        if(res.meta.status!==200) return this.$message.error("查询用户信息失败！");
        this.editForm=res.data
      },

      handleSizeChange(newSize){
        this.queryInfo.pagesize=newSize
        this.getUserList()
      },
      handleCurrentChange(newPage){
         this.queryInfo.pagenum=newPage
         this.getUserList()
      },
      async userStateChanged(userinfo){
       const {data:res}= await this.$axios.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
        if(res.meta.status!==200){
          userinfo.msg_state=!this.userinfo.mg_state
          return this.$message.error("用户状态更新失败！")
        }
        return this.$message.success("用户状态更新成功！")
      },
      addDiglogClosed(){
        this.$refs.addFormRef.resetFields()
      },

      addUser(){
        this.$refs.addFormRef.validate(async valid=>{
          if(!valid) return;
          const {data:res}=await this.$axios.post('users',this.addForm)
          if(res.meta.status!==201) return this.$message.error("添加用户失败")

          this.$message.success("添加用户成功")
          this.getUserList()
          this.addDialogVisible=false
        })
      },
      editDiglogClosed(){
        this.$refs.editFormRef.resetFields()
      },
      editUserInfo(){
        this.$refs.editFormRef.validate(async valid=>{
          if(!valid) return;

          const {data:res}=await this.$axios.put('users/'+this.editForm.id,{email:this.editForm.email,mobile:this.editForm.mobile,})
          if(res.meta.status!==200) return this.$message.error("修改用户失败")

          this.$message.success("修改用户信息成功")
          this.getUserList()
          this.editDialogVisible=false
        })
      },
      async removeUserById(id){
        const confirmResult=await this.$confirm('此操作将永久删除该用户，是否继续？','提示',{
          confirmButtonText:'确定',
          cancelButtonText:'取消',
          type:'warning'
        }).catch(err=>err)
        if(confirmResult!=='confirm'){
          return this.$message.info("已取消删除！")
        }
        const {data:res}=await this.$axios.delete('users/'+id);
        if(res.meta.status!==200) return this.$message.error("删除用户失败")
        this.$message.success("删除用户成功")
        this.queryInfo.pagenum=1;
        this.getUserList()
      },
      async setRole(id,userInfo){
        this.userInfo=userInfo
        // 获取角色列表
        const {
          data: res
        } = await this.$axios.get('roles');
        if (res.meta.status !== 200) return this.$message.error("获取角色列表失败！");
        this.roleList = res.data;
this.setRoleDialogVisible=true
      },
      async saveRoleInfo(){
        if(!this.selectedRoleId) return this.$message.error("未选中要设置的角色！");
        const {data:res}=await this.$axios.put('users/'+this.userInfo.id+'/role',{
          rid:this.selectedRoleId
        })
        if (res.meta.status !== 200) return this.$message.error("设置角色失败！");
        this.$message.success("设置角色成功！");
        this.getUserList()
        this.setRoleDialogVisible=false
      },
      setRoleDialogClosed(){
        this.selectedRoleId='';
        this.userInfo={};
      }
    }
  }
</script>
<style scoped lang="less">
</style>
