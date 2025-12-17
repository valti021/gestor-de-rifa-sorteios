<?php
session_start();
session_unset();
session_destroy();

// Redirecionar para onde você quiser:
header("Location: ../index.html");
exit();
?>
