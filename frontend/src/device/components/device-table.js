import React from "react";
import Table from "../../commons/tables/table";

const columns = [
    {
        Header: "Description",
        accessor: "description",
        minWidth: 100
    },
    {
        Header: "Address",
        accessor: "address",
        minWidth: 100
    },
    {
        Header: "MHC",
        accessor: "mhc",
        minWidth: 60
    },
    {
        Header: "Person",
        accessor: (row) => row.person ? `${row.person.id_ref} (${row.person.id_ref || 'No Ref'})` : 'Unassigned',
        id: 'person.id',
        minWidth: 100
    },
]
let role = sessionStorage.getItem("role");
if (role === "ADMIN") {
    columns.push({
        Header: "Actions",
        accessor: "actions",
        minWidth: 150,
        Cell: ({ row }) => {
            const handleDelete = () => {
                if (
                    window.confirm(
                        `Are you sure you want to delete ${row._original.description}?`
                    )
                ) {
                    row._original.onDelete(row._original.id);
                }
            };
            const handleUpdate = () => {
                row._original.onUpdate(row._original);
            };

            const handleAssign = () => {
                row._original.onAssign(row._original);
            };
            return (
                <div style={{ display: 'flex', justifyContent: "space-between" }}>
                    <button onClick={handleUpdate} className="btn" style={{ backgroundColor: "#54ce00" }}>
                        Update
                    </button>
                    <button onClick={handleDelete} className="btn" style={{ backgroundColor: "#327802" }}>
                        Delete
                    </button>
                    <button onClick={handleAssign} className="btn"
                        style={{ backgroundColor: "#54ce00" }}>
                        Assign Person
                    </button>
                </div>
            );
        },
    });
}
const filters = [
    {
        accessor: 'description',
    },
    {
        accessor: 'address'
    }
];


class DeviceTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tableData: this.props.tableData || [],
            selectedDeviceId: null,
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.tableData !== this.props.tableData) {
            this.setState({ tableData: this.props.tableData || []});
        }
    }

    handleRowClick = (device) => {
        if (device && device.id) {  // Ensure device has an ID
            this.setState({ selectedDeviceId: device.id });
            console.log("Selected Device ID in table:", device.id);
            if (this.props.onDeviceSelect) {
                this.props.onDeviceSelect(device.id);
            }
        }
    };

    render() {
        const tableDataWithDelete = this.state.tableData.map((device) => ({
            ...device,
            onDelete: this.props.onDelete,
            onUpdate: this.props.onUpdate,
            onAssign: this.props.onAssign,
        }));

        return (
            <Table
                key={this.state.tableData.length}
                data={tableDataWithDelete}
                columns={columns}
                search={filters}
                pageSize={5}
                onRowClick={(device) => this.handleRowClick(device)}
            />

        );
    }
}

export default DeviceTable;
