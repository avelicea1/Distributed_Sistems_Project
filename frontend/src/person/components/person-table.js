import React from "react";
import Table from "../../commons/tables/table";

function getCurrentUserEmail() {
    return sessionStorage.getItem("userEmail");
}

const columns = [
    {
        Header: "Name",
        accessor: "name",
        minWidth: 100,
    },
    {
        Header: "Age",
        accessor: "age",
        minWidth: 100,
    },
    {
        Header: "Email",
        accessor: "email",
        minWidth: 100,
    },
    {
        Header: "Actions",
        accessor: "actions",
        minWidth: 60,
        Cell: ({row}) => {
            const currentUserEmail = getCurrentUserEmail();
            const personEmail = row._original.email;

            const handleDelete = () => {
                if (personEmail === currentUserEmail) {
                    alert("You cannot delete your own account.");
                    return;
                }
                if (
                    window.confirm(
                        `Are you sure you want to delete ${row._original.name}?`
                    )
                ) {
                    row._original.onDelete(row._original.id);
                }
            };

            const handleUpdate = () => {
                row._original.onUpdate(row._original);
            };

            return (
                <div style={{display: 'flex', justifyContent: "space-between"}}>
                    <button onClick={handleUpdate} className="btn" style={{backgroundColor: "#54ce00"}}>
                        Update
                    </button>
                    <button onClick={handleDelete} className="btn" style={{backgroundColor: "#327802"}}>
                        Delete
                    </button>
                </div>
            );
        },
    },
];

const filters = [
    {
        accessor: "name"
    }, {
        accessor: "email"
    }
];

class PersonTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tableData: this.props.tableData,
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.tableData !== this.props.tableData) {
            this.setState({tableData: this.props.tableData});
        }
    }

    render() {
        const tableDataWithDelete = this.state.tableData.map((person) => ({
            ...person,
            onDelete: this.props.onDelete,
            onUpdate: this.props.onUpdate,
        }));

        return (
            <Table
                key={this.state.tableData.length}
                data={tableDataWithDelete}
                columns={columns}
                search={filters}
                pageSize={5}
            />
        );
    }
}

export default PersonTable;
