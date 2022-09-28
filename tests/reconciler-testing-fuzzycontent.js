Modulo.utils.elementIH = `
<h1>Tutorial</h1>

<blockquote> <p><strong>Prerequisites:</strong> Part 1 and Part 2 of this
tutorial requires a prerequisite knowledge of HTML &amp; CSS only.  Part 3
requires familiarity with JavaScript. Familiarity with React, Vue, or similar
frameworks is helpful, but not required.</p></blockquote>

<h1>The Modulo Tutorial</h1>
<p>Welcome to the Modulo tutorial. By following this short tutorial, you can
learn how to use Modulo in your own projects.</p>
<p><strong>Ready to dive in to Web Component development with
Modulo?</strong></p>


<mws-section name="part1">Part 1: Components, CParts, Loaders</mws-section>

<h3>Including Modulo</h3>
<p>The first step is to include the Modulo.js file. You can do this one of
2 ways:</p>
<ol>
    <li>Using a script tag to directly link to a CDN</li>
    <li>Downloading the Modulo.js and including it with a script tag, e.g.
    <code>&lt;script src="/js/Modulo.js"&gt;</code>
</li></ol>

<p>Then, Modulo needs to be explicitly activated. Somewhere before the closing body tag of your HTML file, you should activate Modulo with the following code:
    <code>&lt;script&gt;Modulo.defineAll();&lt;script&gt;</code>
</p>


<blockquote>
    <p><strong>Why use "components"?</strong> Have you ever repeated the
    same HTML, CSS, and/or JavaScript while writing a website or or web
    app? <em>Components</em> let you store repeated code in one place. Once
    defined, components can be re-used everywhere, saving developer time
    and reducing mistakes. Furthermore, within teams, components libraries
    improve collaboration between developers./p>
</blockquote>

<h3>Defining your first component</h3>

<p>Once you have included Modulo and activated it, you can define your
first <em>custom component</em>. Right now, we'll do that all in one file,
although soon we'll learn how to split your components into a separate
file, which is the preferred way.</p>


<p><strong>Component definitions</strong> start with a "component"
opening tag in the format of
<code>&lt;component&nbsp;name="HelloWorld"&gt;</code>. Modulo will scan a
document for these tags, defining components for each one it encounters.
Every component definition must specify a name, conventionally in
<code>UpperCamelCase</code>. This is just a convention when writing code:
Technically HTML tag names are all case insensitive, and so while inspecting
the DOM, browsers may display them in <code>all-lowercase</code>.</p>

<p>Once defined, you can use a component by referring to it's name as
though it were a plain HTML tag like &lt;div&gt;. Components can go
anywhere that plain HTML tags can go, and can be styled with CSS the same
way as well. Unlike plain HTML tags, you must use a dash (<code>-</code>)
when referring to a component. This is a rule of the HTML5 Custom
Components standard, which Modulo is based upon.</p>

<p>Modulo's default behavior is to prefix custom components with an
<code>x-</code>. So, if a component is defined like
<code>&lt;component&nbsp;name="HelloWorld"&gt;</code>, then it can be
referenced elsewhere like
<code>&lt;x-HelloWorld&gt;&lt;/x-HelloWorld&gt;</code>.</p>

<p>Finally, one more thing: When defining custom components in an HTML
document, you can't put them scattered everywhere. You have to keep them in one
place.  Specifically, to keep things neater, Modulo searches for component
definitions only within a <code>modulo-embed</code> HTML template tag:
<code>&lt;template modulo-embed&gt;</code></p>

<p>To quickly summarize: Components are reusable bits of HTML, JS, and CSS
code, and must be defined within a tag like
<code>&lt;component&nbsp;name="HelloWorld"&gt;</code>, and then this definition
can be embedded in an HTML page within a tag like
<code>&lt;template&nbsp;modulo-embed&gt;</code>.</p>

<p><strong>Okay, enough talk, let's actually try this out!</strong></p>


<section class="Tutorial-tryit">
    <h4>Try it now</h4>
    <ol>
        <li>Open up an HTML file in your preferred text editor. It's okay
        to start from scratch, or use an existing project.</li>
        <li>Copy &amp; paste in the following code:

<mws-demo text="
<!-- Define a custom component -->
<template is=&quot;modulo-embed&quot;>
    <component name=&quot;HelloWorld&quot;>
        <template>
            Hello <strong>Modulo</strong> World!
        </template>
    </component>
</template>
<!-- Reuse it anywhere, just like any other HTML tag -->
<x-HelloWorld></x-HelloWorld>
<p>In a P tag: <x-HelloWorld></x-HelloWorld></p>
<!-- Finally, include a Modulo CDN link &amp; activate (at the bottom) -->
"></mws-demo>
</li>
        <li>Ensure that the HTML file is opened in your preferred, modern web
        browser (such as Firefox or Chrome) as well.</li>
        <li>Refresh your web browser to view the results.</li>
    </ol>
</section>

<h3>Introducing: Component Parts</h3>

<p>The central concept to Modulo is that of <em>Component Parts</em>.
Because it is so central, saying <em>Component Parts</em> over and over
gets tiresome, so it's typically shortened to <em>CParts</em>.</p>

<blockquote> <p><strong>CParts: The Musical</strong> Think of CParts like the cast and
crew of a musical. Each are assigned to a different task?some are
more flashy and visible, others being stage-hands working behind the
scenes?but they all work together to put on the same
show!</p></blockquote>

<p>All component definitions consist of some number of CParts.  Thus, a
component definition is really just a collection of CPart definitions.
"Under the hood" of your component, each CPart will have a different role
to contribute to the functionality of your component.</p>

<!--<p> When a component definition is later instantiated (i.e., when that
component is used on the page), Modulo will in turn instantiate (i.e.
create an instance of) a CPart for each of the CPart definitions contained
in the component definition.</p>-->

<p>The first two CParts:</p>
<ol>
    <li>
        <strong>Template</strong> - <code>&lt;template&gt;</code>
        <p>Templates are where you put any arbitrary HTML code that you
        want your component to contain. For now, we'll just include some
        unchanging HTML. Later, we'll learn how to use "templating
        language" to control what HTML is produced in what
        circumstance.</p>
    </li>

    <li>

        <blockquote> <p><strong>Where to put CSS</strong> Instead of a
        Style CPart, you can always link a global CSS file the regular way
        to style your components.  However, many developers prefer the
        simplicity of keeping everything in one place, e.g. the CSS with
        the component definition that it styles.</p></blockquote>

        <strong>Style</strong> - <code>&lt;style&gt;</code>
        <p>Just like the <code>&lt;style&gt;</code> tag in HTML, the
        <strong>Style</strong> CPart allows us to write CSS for our
        component. CSS written here will be automatically prefixed so that
        it will only apply to your component and any HTML generated by the
        Template CPart.
        </p>

    </li>
</ol>

<p>Throughout Modulo documentation, there are little code editors, like below.
These allow you to immediately practice new concepts learned. For simplicity,
the top and bottom of the component definition code is omitted.  Instead, these
sample code editors only focus on the CPart definitions within.</p>

<section class="Tutorial-tryit">
    <h4>Try it now</h4>
    <p>Edit the CPart definitions on the left and click RUN to see the results
    on the right!</p>

    <ol>
        <li>Practice modifying the <strong>Template</strong> CPart
        (<code>&lt;template&gt;</code>) to see how that affects the
        output</li>
        <li>Practice modifying the <strong>Style</strong> CPart
        (<code>&lt;style&gt;</code>) to add or modify CSS</li>
        <li>Practice incorporating these CParts into your own components on
        a real page by copying the code here and pasting it within your
        component definition (that is, the one that you created in the
        previous part of this tutorial)<p></p>
    </li></ol>
    <mws-demo demotype="minipreview" fromlibrary="Tutorial_P1"></mws-demo>
</section>


<h3>Modulo Loader</h3>

<p>Up until now, we have practiced with a component embedded on the same
page that it is used. This is not recommended. Instead, you should put your
components in a separate file, and then use the
<code>&lt;modulo-load&gt;</code> tag to import your components into every
HTML file that needs them.</p>


<blockquote> <p><strong>Why use modulo-load?</strong>
Think of the <code>&lt;modulo-load&gt;</code> tag as being analogous to the
<code>&lt;link&gt;</code> tag, which lets multiple HTML files share the
same CSS. The same rationale applies here: Components are "write once, use
everywhere", so the way we get access to them "everywhere" is by
<em>loading</em> them into each file that needs to use them.  Another
reason: <code>&lt;modulo-load&gt;</code> smooths over certain browser
limitations.</p>
</blockquote>

<p>Loader tags look like the following:</p>

<pre>&lt;modulo-load
    src="./components/my-stuff.html"
    namespace="coolstuff"&gt;
&lt;/modulo-load&gt;
</pre>

<p>Let's break this down:</p>
<ul>

    <li>
        <code>src="./components/my-stuff.html"</code>
        <p>The <code>src</code> attribute specifies the source of the
        component library file. This file can be anywhere that is
        accessible to your web-browser or web-server. Ideally, it should be
        in the same place as your CSS and static media files, such as a
        <code>static/</code> directory, or whatever the equivalent is for
        your set-up.</p>
        <p>The component library itself (<code>my-stuff.html</code> in this
        example) should consist of an HTML file filled with
        <code>&lt;component&gt;</code> definitions.</p>
    </li>

    <li>

        <blockquote>
        <p><strong>Why use namespaces?</strong>
        Namespaces allow different component library files to have
        conflicting component names. This is especially useful when using
        third-party component libraries or while working in a big team:
        That way, if both you and another developer define a component with
        some common name (eg <code>name="Button"</code>), there won't be a
        conflict as long as you load each into different namespaces.</p>
        </blockquote>

        <code>namespace="coolstuff"</code>
        <p>The <code>namespace</code> attribute specifies the
        <em>namespace prefix</em>, which is combined with a dash and the
        component name in order to create the component's <em>full
        name</em>. </p>
        <p><strong>Example:</strong> If <code>my-stuff.html</code> has a component
        defined like <code>&lt;component name="MyThing"&gt;</code>
        imported with <code>namespace="coolstuff"</code>, then the
        resulting full name would be <code>coolstuff-MyThing</code>, and
        we'd use the component like<br>
        <code>&lt;coolstuff-MyThing&gt;&lt;/coolstuff-MyThing&gt;</code>.</p>
    </li>


    <li><strong>Where to put it:</strong> Loaders can go anywhere. For
    neatness, consider putting them either within the
    <code>&lt;head&gt;</code> tag, or near the <code>&lt;/body&gt;</code>
    closing tag.</li>
</ul>


<section class="Tutorial-tryit">
    <h4>Try it now</h4>
    <p>It's time to "promote" your beginner embedded component into a
    full-fledged loaded component!</p>
    <ol>
        <li>Optional: Create a new "components" directory to house your
        component library files.</li>
        <li>Create a new file for your component library within your
        components directory (or elsewhere). You could call it, for
        example, <code>my-component-lib.html</code></li>
        <li>Copy your existing <code>HelloWorld</code> component definition
        from your main HTML file into this new file, and then delete it
        from your main HTML file</li>
        <li>Add a <code>modulo-load</code> tag to your main HTML file. It
        should have the <code>src=</code> attribute pointing toward a
        relative path to your new component library file, and namespace can
        be <code>lib</code>.  For example, if you named everything based on
        the above suggestions, it would look like this:
<pre>&lt;modulo-load src="./components/my-component-lib.html"
            namespace="lib"&gt;&lt;/modulo-load&gt;
</pre></li>

        <li>Finally, update your component usage to now use the new
        namespace (instead of the "x" default namespace placeholder):
<pre>&lt;lib-HelloWorld&gt;&lt;/lib-HelloWorld&gt;
&lt;p&gt;In a P tag: &lt;lib-HelloWorld&gt;&lt;/lib-HelloWorld&gt;&lt;/p&gt;
</pre></li>
        <li>Refresh the web browser to view the results. If done correctly,
        nothing should change. To confirm it's working, try editing your
        component in the library file and refresh to see the results.</li>
    </ol>
    <p><strong>Bonus Challenge:</strong>
    Try practicing with multiple "main HTML" files sharing the same
    component library. Also, practice changing the namespace, or see if you
    can cause (and fix using the namespace attribute) a naming conflict
    with two components.</p>
</section>


<h3>Part 1: Summary</h3>

<p>In this tutorial, we learned what a <em>Component</em> is, and how to
define one, about what <em>CParts</em> are, and two important CParts
(<em>Template</em>, for HTML, and <em>Style</em>, for CSS), and finally how
to keep our components in a component library and then load that library
into different HTML files. At this point, you can already start getting
useful results from using Modulo, since even without JavaScript usage we
are already defining simple components that can help us re-use HTML code
between different pages.</p>


<h4>Key terms</h4>

<ul>
<li> <strong>Component</strong> - A discrete, re-usable bit of code, typically used to show a
graphical UI element (eg a button, or a rich-text area). Components can also
use other components (eg a form component might contain both of the above as
child components).  Every component is defined as a collection of CParts (e.g.
HTML <em>Template</em>, or <em>Style</em> tag).</li>
<li>ComponentPart, or <strong>CPart</strong> - Each component consists of a
"bag" or "bundle" of CParts, each CPart being a "pluggable" module that
supplies different functionality for that component.</li>
<li><strong>customElement</strong> - The term used for a custom HTML5 web
component, which is the underlying technology that Modulo is a thin wrapper
over. They all have dashes (<code>-</code>) in the name.</li>
</ul>



<p>In the subsequent tutorials we will go deeper: Explore the full
capabilities of Templates, allow flexible and composable components with
Props CPart, create custom behavior with Script CParts,  and finally create
forms and interactive, changing components with the State CPart.</p>




<mws-section name="part2">Part 2: Props and Templating</mws-section>

<blockquote> <p><strong>Why use Props?</strong>
Components are "write once, use everywhere". That is to say, you only need to
define a component once to use it throughout your pages. However, sometimes you
want each instance of a component to have different content or modified
behavior. This is where <em>Props</em> come into play: They allow you to
customize differences in content or behavior between multiple uses of the same
component.</p>
</blockquote>


<h3>CPart: Props</h3>

<p>The <em>Props</em> CPart defines the <em>properties</em> that can be
customized about a component. It allows for options or other data to be
"passed" to a component instance, in order to distinguish that instance from
other ones. For example, a button component might have <em>Props</em> that
specify its text, or which shape variation.</p>


<section class="Tutorial-tryit">
    <h4>Try it now</h4>
    <p>Context: The <code>&lt;tutorial-Button&gt;</code> component has already
    been defined for you. It was defined to accept two <em>props</em>:
    <code>label</code>, and <code>shape</code>. We'll cover how it was defined
    to use these <em>props</em> later on. For now, practice using the
    button.</p>

    <ol>
        <li>Examine the code below. See how the code uses the
        <code>tutorial-Button</code> component?</li>
    </ol>


<mws-demo text="
<template>
Hello <strong>Modulo</strong> World!
<p class=&quot;neat&quot;>Any HTML can be here!</p>
</template>
<style>
/* ...and any CSS here! */
strong {
    color: blue;
}
.neat {
    font-variant: small-caps;
}
</style>
">
</mws-demo>
</section>


<mws-demo text="
<template>
    <p>Trying out the button...</p>
    <tutorial-Button
        label=&quot;Button Example&quot;
        shape=&quot;square&quot;
    ></tutorial-Button>

    <p>Another button...</p>
    <tutorial-Button
        label=&quot;Rounded is Great Too&quot;
        shape=&quot;rounded&quot;
    ></tutorial-Button>
</template>
">
</mws-demo>



<mws-demo text="
<component name=&quot;Button&quot;>
    <props
        label
        shape
    ></props>
    <template>
        <button class=&quot;my-btn my-btn_{{ props.shape }}&quot;>
            {{ props.label }}
        </button>
    </template>
</component>
"></mws-demo>





<mws-section name="part3">Part 3: State and Script</mws-section>

coming soon!

`;

Modulo.utils.componentIH = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf8" />
    <title>Tutorial - modulojs.org</title>
    <link rel="stylesheet" href="/js/codemirror_5.63.0/codemirror_bundled.css" />
    <link rel="stylesheet" href="/css/style.css" />
    <link rel="icon" type="image/png" href="/img/mono_logo.png" />
    <disabled-script src="/js/codemirror_5.63.0/codemirror_bundled.js"></disabled-script>

    <!--
    <mod-load src="/components/modulowebsite.html" namespace="mws"></mod-load>
    <mod-load src="/components/examplelib.html" namespace="eg"></mod-load>
    <mod-load src="/components/embeddedexampleslib.html" namespace="docseg"></mod-load>
    -->
</head>
<body>

<nav class="Navbar">
    <a href="/index.html"><img src="/img/mono_logo.png" style="height:70px" alt="Modulo" /></a>
    <ul>
        <li>
            <a href="/index.html#about" >About</a>
        </li>
        <li>
            <a href="/start.html" >Start</a>
        </li>
        <li>
            <a href="/docs/" class="Navbar--selected">Docs</a>
        </li>
    </ul>

    <div class="Navbar-rightInfo">
        v: undefined<br />
        SLOC: undefined lines<br />
        <a href="https://github.com/michaelpb/modulo/">github</a> | 
        <a href="https://npmjs.com/michaelpb/modulo/">npm</a> 
    </div>
</nav>


    <main class="Main Main--fluid Main--withSidebar">
        <aside class="TitleAside TitleAside--navBar" >
            <h3><span alt="Lower-case delta">%</span></h3>
            <nav class="TitleAside-navigation">
                <h3>Documentation</h3>
                <mws-DocSidebar path="tutorial.html"></mws-DocSidebar>
            </nav>
        </aside>
        <aside style="border: none" [component.slot]>
        </aside>
    </main>


<footer>
    <main>
        (C) 2021 - Michael Bethencourt - Documentation under LGPL 3.0
    </main>
</footer>

</body>
</html>
`;

