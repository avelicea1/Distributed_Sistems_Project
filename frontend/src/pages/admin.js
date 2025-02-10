import React from 'react';

import BackgroundImg from '../commons/images/energy-management.jpg';

import { Container, Jumbotron} from 'reactstrap';

const backgroundStyle = {
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    width: "100%",
    height: "100vh",
    backgroundImage: `url(${BackgroundImg})`,
};
const containerStyle = {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center"
};

class Admin extends React.Component {


    render() {

        return (

            <div style={{ margin: 0, padding: 0, overflow: 'hidden', height: '100vh' }}>
                <Jumbotron fluid style={backgroundStyle}>
                    <Container fluid style={containerStyle}>

                    </Container>
                </Jumbotron>

            </div>
        )
    };
}

export default Admin
