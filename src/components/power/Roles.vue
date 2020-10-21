<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible=true">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="roleList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-row v-for="(item1,i1) in props.row.children" :key="item1.id" :class="['vcenter','border-bottom',i1==0?'border-top':''] ">
              <el-col :span="5">
                <el-tag type="primary" closable @close="removeRightById(props.row,item1.id)">
                  {{item1.authName}}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <el-row v-for="(item2,i2) in item1.children" :key="item2.id" :class="['vcenter',i2!==0?'border-top':''] ">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(props.row,item2.id)">
                      {{item2.authName}}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag type="warning" closable v-for="item3 in item2.children" :key="item3.id" @close="removeRightById(props.row,item3.id)">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column label="#" type="index">
        </el-table-column>
        <el-table-column :label="item.label" :prop="item.prop" v-for="(item,index) in tableHead" :key="index"
          :min-width="item.width?item.width:'auto'">
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
    </el-card>
    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="addDiglogClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改角色对话框 -->
    <el-dialog title="修改角色" :visible.sync="editDialogVisible" width="50%" @close="editDiglogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限 -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClosed">
      <el-tree ref="tree" :data="rightslist" show-checkbox node-key="id" :props="defaultProps" :default-checked-keys="defaultCheckedKeys"
        :default-expand-all="true">
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRight">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
  export default {
    created() {
      this.getRolesList()
    },
    data() {
      return {
        roleList: [],
        tableHead: [{
          label: '角色名称',
          prop: 'roleName',
          width: '200px',
        }, {
          label: '角色描述',
          prop: 'roleDesc',
          width: '200px',
        }, {
          label: '操作',
          type: 'button',
          width: '300px',
          btnArr: [{
            type: 'primary',
            value: '编辑',
            icon: 'el-icon-edit',
            handle: this.editDialogShow
          }, {
            type: 'danger',
            value: '删除',
            icon: 'el-icon-delete',
            handle: this.removeRoleById
          }, {
            type: 'warning',
            value: '分配权限',
            icon: 'el-icon-setting',
            handle: this.showSetRightDialog
          }, ]
        }, ],
        addDialogVisible: false,
        addForm: {
          username: '',
          password: '',
          email: '',
          mobile: ''
        },
        addFormRules: {
          roleName: [{
            required: true,
            message: "请输入角色名称",
            trigger: "blur"
          }, {
            min: 2,
            max: 10,
            message: "长度在2到10个字符之间",
            trigger: "blur"
          }, ],
          roleDesc: [{
            required: true,
            message: "请输入角色描述",
            trigger: "blur"
          }, {
            min: 2,
            max: 50,
            message: "长度在2到50个字符之间",
            trigger: "blur"
          }, ],
        },
        editFormRules: {
          roleName: [{
            required: true,
            message: "请输入角色名称",
            trigger: "blur"
          }, {
            min: 3,
            max: 10,
            message: "长度在3到10个字符之间",
            trigger: "blur"
          }, ],
          roleDesc: [{
            required: true,
            message: "请输入角色描述",
            trigger: "blur"
          }, {
            min: 2,
            max: 50,
            message: "长度在2到50个字符之间",
            trigger: "blur"
          }, ],
        },
        editDialogVisible: false,
        editForm: {},
        setRightDialogVisible: false,
        rightslist: [],
        defaultProps: {
          children: 'children',
          label: 'authName'
        },
        defaultCheckedKeys: [],
        roleId:0
      }
    },
    methods: {
      // 获取角色列表
      async getRolesList() {
        const {
          data: res
        } = await this.$axios.get('roles');
        if (res.meta.status !== 200) return this.$message.error("获取角色列表失败！");
        this.roleList = res.data;
      },
      // 弹出编辑角色对话框
      async editDialogShow(id) {
        this.editDialogVisible = true;
        const {
          data: res
        } = await this.$axios.get('roles/' + id);
        if (res.meta.status !== 200) return this.$message.error("查询角色信息失败！");
        this.editForm = res.data
      },
      //添加角色对话框关闭时，初始化表单
      addDiglogClosed() {
        this.$refs.addFormRef.resetFields()
      },
      //添加角色
      addRole() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return;
          const {
            data: res
          } = await this.$axios.post('roles', this.addForm)
          if (res.meta.status !== 201) return this.$message.error("添加角色失败")
          this.$message.success("添加角色成功")
          this.getRolesList()
          this.addDialogVisible = false
        })
      },
      //编辑角色对话关闭时，初始化表单
      editDiglogClosed() {
        this.$refs.editFormRef.resetFields()
      },
      //编辑角色信息
      editRoleInfo() {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return;
          const {
            data: res
          } = await this.$axios.put('roles/' + this.editForm.roleId, {
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc,
          })
          if (res.meta.status !== 200) return this.$message.error("修改角色失败")
          this.$message.success("修改角色信息成功")
          this.getRolesList()
          this.editDialogVisible = false
        })
      },
      //删除角色
      async removeRoleById(id) {
        const confirmResult = await this.$confirm('此操作将永久删除该角色，是否继续？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        if (confirmResult !== 'confirm') {
          return this.$message.info("已取消删除！")
        }
        const {
          data: res
        } = await this.$axios.delete('roles/' + id);
        if (res.meta.status !== 200) return this.$message.error("删除角色失败")
        this.$message.success("删除角色成功")
        this.getRolesList()
      },
      //删除角色权限
      async removeRightById(role, rightId) {
        const confirmResult = await this.$confirm('确定要删除该权限吗？', '提示', {
          type: "warning"
        }).catch(err => err)
        if (confirmResult !== "confirm") return this.$message.info("取消了删除")
        const {
          data: res
        } = await this.$axios.delete(`roles/${role.id}/rights/${rightId}`)
        if (res.meta.status !== 200) return this.$message.error("删除权限失败")
        this.$message.success("删除成功！")
        role.children = res.data;
      },
      //设置角色权限对话框弹出
      async showSetRightDialog(id, row) {

        //获取完整的权限列表
        const {
          data: res
        } = await this.$axios.get('rights/tree');
        if (res.meta.status !== 200) return this.$message.error("获取权限列表失败！");
        this.rightslist = res.data
        this.getLeafKeys(row, this.defaultCheckedKeys)
        this.roleId=id;
        this.setRightDialogVisible = true;
      },
      //递归获取最里层的id数组集合，并返回
      getLeafKeys(node, arr) {
        if (!node.children) {
          return arr.push(node.id)
        }
        node.children.forEach(item => {
          this.getLeafKeys(item, arr)
        })
      },
      // 树形控件默认选中值清除缓存
      setRightDialogClosed(){
        this.defaultCheckedKeys=[]
      },
      //给角色设置权限
      async setRight() {
        const checkKeys=[...this.$refs.tree.getCheckedKeys(),...this.$refs.tree.getHalfCheckedKeys()]
        const {
          data: res
        } = await this.$axios.post('roles/' + this.roleId+'/rights', {
          rids:checkKeys.join(',')
        })
        if (res.meta.status !== 200) return this.$message.error("修改权限失败")
        this.$message.success("修改权限成功")
        this.getRolesList()
        this.setRightDialogVisible = false;

      }
    },
  }
</script>
<style scoped lang="less">
  .border-bottom {
    border-bottom: 1px solid #eee;
  }

  .border-top {
    border-top: 1px solid #eee;
  }

  .el-tag {
    margin: 6px;
  }

  .vcenter {
    display: flex;
    align-items: center;
  }
</style>
