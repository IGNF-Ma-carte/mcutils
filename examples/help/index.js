import '../../Carte'
import helpDialog from "../../dialog/helpDialog";
import md from "./help.txt"

helpDialog(document.querySelector('i'), md, { title: 'Lorem Ipsum', className: 'large' });

helpDialog(document.querySelector('h1'), 'Une aide en ligne', { title: 'Aide', className: 'small' });

window.helpDialog = helpDialog;