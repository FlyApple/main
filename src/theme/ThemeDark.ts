import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import theme_blue from '@material-ui/core/colors/blue';
import theme_bluegrey from '@material-ui/core/colors/blueGrey';
import theme_red from '@material-ui/core/colors/red';
import theme_orange from '@material-ui/core/colors/orange';
import theme_green from '@material-ui/core/colors/green';
import theme_grey from '@material-ui/core/colors/grey';

//
export const ThemeDark = createMuiTheme({
    typography: {

    },
    palette: {
      //type: 'dark',
      primary: {
        // dark: 这将从 palette.primary.main 中进行计算，
        main: '#303030',
        // contrastText: 这将计算与 palette.primary.main 的对比度
      },
      secondary: {
        main: theme_blue[700],
      },
      error: {
        main: theme_red[500],
      },
      warning: {
        main: theme_orange[500],
      },
      info: {
        main: theme_blue[500],
      },
      success: {
        main: theme_green[500],
      },
      text: {
        primary: theme_grey[800],
        secondary: theme_grey[600],
        disabled: theme_grey[400],
        hint: theme_blue[600],
      },
      divider: theme_grey[400],
      background: {
        paper: theme_grey[400],
        default: theme_grey[100],
      },
      action: {
        active: theme_grey[800],
        hover: theme_blue[700],
        selected: theme_blue[600],
        focus: theme_blue[600]
      },
      // 使用 `getContrastText()` 来最大化
      // 背景和文本的对比度
      contrastThreshold: 3,
      // 使用下面的函数用于将颜色的亮度在其调色板中
      // 移动大约两个指数。
      // 例如，从红色 500（Red 500）切换到 红色 300（Red 300）或 红色 700（Red 700）。
      tonalOffset: 0.2
    },
  });
  