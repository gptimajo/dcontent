<?php
if(!empty($_POST)){
	echo htmlentities($_POST['text']);
}

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>DContent demo</title>
<link rel="stylesheet" type="text/css" href="css/jquery-ui.css" />
<link rel="stylesheet" type="text/css" href="css/dcontent.css" />

<style type="text/css">
</style>
</head>
<body>
<form action="./" method="post">
<!--<textarea name="text" class="dcontent" cols="40" rows="6"><?php echo htmlentities(!empty($_POST['text'])?$_POST['text']:'<div id="dc-txt1350561949324"><p>test</p></div><div id="dc-lst1350561952387"><ul><li>test</li><li>test<div id="dc-lst1350561952388"><ul><li>test</li><li>test<div id="dc-lst1350561952389"><ul><li>test</li><li>test</li><li>test</li></ul></div></li><li>test</li></ul></div></li><li>test</li></ul></div><div id="dc-tbl1350561960387"><table><tbody><tr><td>a</td><td>b</td><td>c</td></tr><tr><td>d</td><td>e</td><td>f</td></tr></tbody></table></div>'); ?></textarea>-->
<textarea name="text" class="dcontent" cols="40" rows="6"><?php echo (!empty($_POST))?htmlentities($_POST['text']):''; ?></textarea>


<script type="text/javascript" src="js/jquery.min.js"></script>
<script type="text/javascript" src="js/jquery-ui.min.js"></script>
<script type="text/javascript" src="js/tinymce/jquery.tinymce.js"></script>
<script type="text/javascript" src="js/dcontent.js"></script>
<script type="text/javascript">
	var dc = new DContent(jQuery('.dcontent'),{'controls':['text','list','table']});
</script>
<input type="submit" value="Save" onclick="dc.save();"/>
</form>
</body>
</html>
