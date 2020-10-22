<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert show-icon title="注意,只允许为第三级分类设置相关参数!" type="warning">
      </el-alert>
      <el-row class="mt20">
        <el-col>
          <el-form>
            <el-form-item label="选择商品分类">
              <el-cascader :options="parentcatelist" :props="cascaderProps" v-model="selectedKeys" @change="updateTableData"></el-cascader>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
      <el-tabs v-model="activeName" @tab-click="tabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-row>
            <el-col>
              <el-button type="primary" size="mini" @click="addDialogVisible=true" :disabled="selectedKeys.length==0">添加参数</el-button>
            </el-col>
          </el-row>
          <el-table :data="manyParamsList" border>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">

                <div class="tag-group">

                    <el-tag v-for="(item,index) in scope.row.attr_vals" :key="index" @close="removeTag(index,scope.row)" closable >
                      {{ item}}
                    </el-tag>
                  <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput"
                    size="small" @keyup.enter.native="addTag(scope.row)"  @blur="addTag(scope.row)">
                  </el-input>
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                </div>
              </template>
            </el-table-column>
            <!-- 序号 -->
            <el-table-column label="#" type="index">
            </el-table-column>
            <!-- 参数名称 -->
            <el-table-column label="参数名称" prop="attr_name">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" plain size="mini" icon="el-icon-edit" @click="editDialogShow(scope.row)">修改</el-button>
                <el-button type="warning" plain size="mini" icon="el-icon-delete" @click="delParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-row>
            <el-col>
              <el-button type="primary" size="mini" @click="addDialogVisible=true" :disabled="selectedKeys.length==0">添加属性</el-button>
            </el-col>
          </el-row>
          <el-table :data="onlyParamsList" border>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <el-table-column type="expand">
                <template slot-scope="scope">
              
                  <div class="tag-group">
              
                      <el-tag v-for="(item,index) in scope.row.attr_vals" :key="index" @close="removeTag(index,scope.row)" closable >
                        {{ item}}
                      </el-tag>
                    <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput"
                      size="small" @keyup.enter.native="addTag(scope.row)"  @blur="addTag(scope.row)">
                    </el-input>
                    <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table-column>
            <!-- 序号 -->
            <el-table-column label="#" type="index">
            </el-table-column>
            <!-- 参数名称 -->
            <el-table-column label="属性名称" prop="attr_name">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" plain size="mini" icon="el-icon-edit" @click="editDialogShow(scope.row)">修改</el-button>
                <el-button type="warning" plain size="mini" icon="el-icon-delete" @click="delParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数对话框 -->
    <el-dialog :title="'添加'+titleText" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <el-form :model="addParamsForm" :rules="addParamsFormRules" ref="addParamsFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改参数对话框 -->
    <el-dialog :title="'修改'+titleText" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editParamsForm" :rules="editParamsFormRules" ref="editParamsFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
  export default {
    created() {
      this.getParentCateList();
    },
    data() {
      return {
        parentcatelist: [],
        manyParamsList: [],
        onlyParamsList: [],
        cascaderProps: {
          value: 'cat_id',
          label: 'cat_name',
        },
        // 选中的父级分类的id数组
        selectedKeys: [],
        // tab的index
        activeName: 'many',
        addDialogVisible: false,
        addParamsForm: {},
        addParamsFormRules: {
          attr_name: [{
            required: true,
            message: '请输入参数名称',
            trigger: 'blur'
          }, ]
        },
        editDialogVisible: false,
        editParamsForm: {
          attr_id: '',
          attr_name: ''
        },
        editParamsFormRules: {
          attr_name: [{
            required: true,
            message: '请输入参数名称',
            trigger: 'blur'
          }, ]
        },
        // 动态添加tag
        inputVisible: false,
        inputValue: '',
      }
    },
    computed: {
      titleText() {
        if (this.activeName == 'many') return '动态参数';
        return '静态属性';
      },
      cat_id() {
        return this.selectedKeys[this.selectedKeys.length - 1]
      }
    },
    methods: {
      // 获取分类
      async getParentCateList() {
        const {
          data: res
        } = await this.$axios.get('categories', {
          params: {
            type: 3
          }
        });
        if (res.meta.status !== 200) return this.$message.error("获取分类失败！");
        this.parentcatelist = res.data;
      },
      // 获取参数列表
      async getParamsList() {
        if(this.selectedKeys.length!==3){
          this.selectedKeys=[]
          this.manyParamsList=[]
          this.onlyParamsList=[]
          return
        }
        const {
          data: res
        } = await this.$axios.get('categories/' + this.cat_id + '/attributes', {
          params: {
            sel: this.activeName
          }
        });
        if (res.meta.status !== 200) {
          return this.$message.error("获取参数失败！");
        }
        res.data.forEach(item => {

          item.attr_vals =item.attr_vals? item.attr_vals.split(" "):[]
          item.inputVisible=false
          item.inputValue=''
        })
        this.paramsList = res.data;
        if (this.activeName == 'many') {
          this.manyParamsList = res.data;
        } else if (this.activeName == 'only') {
          this.onlyParamsList = res.data;
        } else {
          return this.$message.error("获取分类失败！");
        }
      },
      updateTableData() {
        this.getParamsList();
      },
      tabClick() {
        this.getParamsList();
      },
      // 打开添加参数对话框
      // 打开编辑对话框
      editDialogShow(row) {
        this.editDialogVisible = true
        this.editParamsForm.attr_id = row.attr_id
        this.editParamsForm.attr_name = row.attr_name
      },
      // 删除参数
      async delParams(attr_id) {
        const confirmResult = await this.$confirm('此操作将永久删除该参数，是否继续？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        if (confirmResult !== 'confirm') {
          return this.$message.info("已取消删除！")
        }
        const {
          data: res
        } = await this.$axios.delete(`categories/${this.cat_id}/attributes/${attr_id}`);
        if (res.meta.status !== 200) return this.$message.error("删除参数失败")
        this.$message.success("删除参数成功")
        this.getParamsList()
      },
      addDialogClosed() {
        this.$refs.addParamsFormRef.resetFields()
      },
      editDialogClosed() {
        this.$refs.editParamsFormRef.resetFields()
      },
      addParams() {
        this.$refs.addParamsFormRef.validate(async valid => {
          if (!valid) return;
          const {
            data: res
          } = await this.$axios.post(`categories/${this.cat_id}/attributes`, {
            attr_name: this.addParamsForm.attr_name,
            attr_sel: this.activeName,
          });
          if (res.meta.status !== 201) {
            return this.$message.error("添加参数失败！");
          }
          this.$message.success("添加参数成功！");
          this.getParamsList();
          this.addDialogVisible = false
        })
      },
      editParams() {
        this.$refs.editParamsFormRef.validate(async valid => {
          if (!valid) return;
          const {
            data: res
          } = await this.$axios.put(`categories/${this.cat_id}/attributes/${this.editParamsForm.attr_id}`, {
            attr_name: this.editParamsForm.attr_name,
            attr_sel: this.activeName,
          });
          if (res.meta.status !== 200) {
            return this.$message.error("修改参数失败！");
          }
          this.$message.success("修改参数成功！");
          this.getParamsList();
          this.editDialogVisible = false
        })
      },
      async saveAttrVals(row){
        const {
          data: res
        } = await this.$axios.put(`categories/${this.cat_id}/attributes/${row.attr_id}`, {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals:row.attr_vals.join(' ')
        });
        if (res.meta.status !== 200) {
          return this.$message.error("修改参数项失败！");
        }
        this.$message.success("修改参数项成功！");
      },
      removeTag(index,row){
        row.attr_vals.splice(index,1);
        this.saveAttrVals(row);
      },
      showInput(row) {
       row.inputVisible = true;

        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
      },
     addTag(row) {

        let inputValue = row.inputValue;
        if (inputValue.trim().length!==0) {
          row.attr_vals.push(inputValue);
        }
        this.saveAttrVals(row)
        row.inputVisible = false;
        row.inputValue = '';


      }
    }
  }
</script>
<style lang="less">
  .el-tag {
    margin-right: 10px;
    margin-bottom: 10px;
  }

  .button-new-tag {
    margin-left: 10px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }

  .input-new-tag {
    width: 90px;
    margin-left: 10px;
  }
</style>
