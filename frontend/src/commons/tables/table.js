import React, {Component} from "react";
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import Field from "./fields/Field";
import {Col, Row} from "react-bootstrap";

class Table extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data: props.data || [],
            columns: props.columns,
            search: props.search,
            filters: [],
            getTrPropsFunction: props.getTrProps,
            pageSize: props.pageSize || 10,
        };
    }

    search() {

    }

    filter(data) {
        return this.state.filters.every(val => {
            if (String(val.value) === "") {
                return true;
            }
            return String(data[val.accessor]).toLowerCase().startsWith(String(val.value).toLowerCase());
        });
    }

    handleChange(value, index, header) {
        if (this.state.filters === undefined)
            this.setState({filters: []});

        this.state.filters[index] = {
            value: value.target.value,
            accessor: header
        };

        this.forceUpdate();
    }


    getTRPropsType(state, rowInfo) {
        if (rowInfo) {
            return {
                style: {
                    textAlign: "center"
                }
            };
        } else
            return {};
    }


    render() {
        let data = this.state.data ? this.state.data.filter(data => this.filter(data)) : [];

        return (
            <div>
                <Row>
                    {
                        this.state.search.map((header, index) => {
                            return (
                                <Col key={index}>
                                    <div>
                                        <Field id={header.accessor} label={header.accessor}
                                               onChange={(e) => this.handleChange(e, index, header.accessor)}/>
                                    </div>
                                </Col>
                            )
                        })
                    }
                </Row>
                <Row>
                    <Col>
                        <ReactTable
                            data={data}
                            resolveData={data => data.map(row => row)}
                            columns={this.state.columns}
                            defaultPageSize={this.state.pageSize}
                            getTrProps={(state, rowInfo) => {
                                if (rowInfo && this.props.onRowClick) {
                                    return {
                                        onClick: () => {
                                            console.log("Row clicked:", rowInfo.original); // Log row data
                                            this.props.onRowClick(rowInfo.original);  // Pass full row data to onRowClick
                                        },
                                        style: { cursor: 'pointer', textAlign: "center" },
                                    };
                                }
                                return {};
                            }}
                            showPagination={true}
                            style={{
                                height: '300px'
                            }}
                        />
                    </Col>
                </Row>
            </div>
        )
    }
}

export default Table;
