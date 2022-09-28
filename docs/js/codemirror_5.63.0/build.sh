# Super hacky build script just to get codemirror working.
# Later, I will implement mdu-CodeMirror which will be based on a rollup of
# CodeMirror 6

# Order in example:
# <link rel="stylesheet" href="../../lib/codemirror.css">
# <link rel="stylesheet" href="../../theme/mdn-like.css">
# <script src="../../lib/codemirror.js"></script>
# <script src="../../addon/mode/overlay.js"></script>
# <script src="../xml/xml.js"></script>
# <script src="../htmlmixed/htmlmixed.js"></script>
# <script src="django.js"></script>

cat\
    lib/codemirror.js\
    addon/mode/overlay.js\
    mode/xml/xml.js\
    mode/css/css.js\
    mode/javascript/javascript.js\
    mode/htmlmixed/htmlmixed.js\
    mode/django/django.js\
    > codemirror_bundled.js

cat\
    lib/codemirror.css\
    theme/eclipse.css\
    > codemirror_bundled.css

