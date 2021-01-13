//
import React from 'react';

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import FavoriteIcon from '@material-ui/icons/Favorite';
import ShareIcon from '@material-ui/icons/Share';
import ChatIcon from '@material-ui/icons/Chat';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import TurnedInIcon from '@material-ui/icons/TurnedIn';

import './CardItem.css';
import { Box } from '@material-ui/core';

//
export class CardItem extends React.Component {

    //
    public constructor(props) {
        super(props);
    }
    
    componentDidMount() {
        console.info("home");
    }
    
    componentWillUnmount() {
    }
    render() {
        return (<React.Fragment>
            <Card className="CardItem">
                <CardHeader className="CardItem header"
                    avatar={ 
                        <Avatar className="CardItem header avatar" aria-label="avater">A</Avatar> 
                    }
                    action={
                        <IconButton className="CardItem header menu" aria-label="popup menu"><MoreVertIcon /></IconButton>
                    }
                    title={
                        <Box>
                            <Typography className="CardItem header title" variant="subtitle2">
                            Shrimp and Chorizo Paella
                            </Typography>
                            <TurnedInIcon aria-label="icon-top" className="CardItem header title-icon"/>
                        </Box>
                    }
                    subheader={
                        <Box>
                            <Typography className="CardItem header title-sub" variant="caption">
                            Admin Post
                            </Typography>
                            <Typography className="CardItem header title-sub" variant="caption">
                            September 14, 2016
                            </Typography>
                        </Box>
                    }
                />
                <CardContent className="CardItem content">
                    <Typography variant="body2">
                    This impressive paella is a perfect party dish and a fun meal to cook together with your
                    guests. Add 1 cup of frozen peas along with the mussels, if you like.
                    This impressive paella is a perfect party dish and a fun meal to cook together with your
                    guests. Add 1 cup of frozen peas along with the mussels, if you like.
                    </Typography>
                </CardContent>
                <Divider variant="fullWidth" className="CardItem divider"/>
                <CardActions disableSpacing className="CardItem actions right-align">
                    <Grid container direction="row" justify="flex-end" alignItems="center">
                    <Button className="CardItem actions icon" aria-label="share" startIcon={<ShareIcon />}>999+</Button>
                    <Button className="CardItem actions icon" aria-label="favorites" startIcon={<FavoriteIcon />}>888+</Button>
                    <Button className="CardItem actions icon" aria-label="like" startIcon={<ThumbUpIcon />}>666+</Button>
                    <Button className="CardItem actions icon" aria-label="comment" startIcon={<ChatIcon />}>777+</Button>
                    </Grid>
                </CardActions>
            </Card>
        </React.Fragment>
        );
    }
};