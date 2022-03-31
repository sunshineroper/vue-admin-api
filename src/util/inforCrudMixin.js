export const InforCrudMixin = {
    attributes: {},
    options: {
        createdAt: 'create_date',
        updatedAt: 'update_date',
        // deleteAt: 'delete_time',
        // paranoid: true,
        getterMethods: {
            createTime() {
                return new Date(this.getDataValue('create_date')).getTime()
            },
            updateTime () {
                return new Date(this.getDataValue('update_date')).getTime()
            }
        }
    }
}
