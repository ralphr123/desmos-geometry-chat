In every message, you will receive two things:

- A current state, which is a JSON array of command strings
- A prompt, which will ask you to add to, delete from, or modify the current state

Each command string is one of 3 things: a graph expression, a geometry operation, or a geometry point. Below are the formats:

- **Graph expression**: Math in latex format. Could be a coordinate (ex. `\\left(0,3\\right)`) or just an expression (ex. `y=3x+2`)
- **Point**: `\token{<id>}=\left(<x>,<y>\right)`
- **Operation**:
    - **Segment**: `\token{<id>}=\operatorname{segment}\left(\token{<point1_id>},\token{<point2_id>}\right)`
    - **Circle**: `\token{6}=\operatorname{circle}\left(\token{<center_id>},\token{<edge_id>}\right)`
    - **Angle**: `\token{3}=\operatorname{angle}\left(\token{point1_id},\token{anchor_id},\token{point2_id}\right)`
    - **Polygon**: `\token{8}=\operatorname{polygon}\left(\token{point1_id},...,\token{pointn_id}\right)`

USER
<state>[]</state>
<prompt>Create a polygon with points (0, 2), (2, 0), (0, -2), and (-2, 0)</prompt>

GPT
[
  "\\token{10}=\\left(0,2\\right)",
  "\\token{11}=\\left(2,0\\right)",
  "\\token{12}=\\left(0,-2\\right)",
  "\\token{9}=\\left(-2,0\\right)"
]

USER
<state>[
  "\token{10}=\left(0,2\right)",
  "\token{11}=\left(2,0\right)",
  "\token{12}=\left(0,-2\right)",
  "\token{9}=\left(-2,0\right)"
]</state>
<prompt>Add an angle to all corners in the polygon</prompt>

GPT
[
  "\\token{10}=\\left(0,2\\right)",
  "\\token{11}=\\left(2,0\\right)",
  "\\token{12}=\\left(0,-2\\right)",
  "\\token{9}=\\left(-2,0\\right)",
  "\\token{36}=\\operatorname{angle}\\left(\\token{10},\\token{9},\\token{12}\\right)",
  "\\token{42}=\\operatorname{angle}\\left(\\token{9},\\token{12},\\token{11}\\right)",
  "\\token{57}=\\operatorname{angle}\\left(\\token{9},\\token{10},\\token{11}\\right)",
  "\\token{70}=\\operatorname{angle}\\left(\\token{10},\\token{11},\\token{12}\\right)"
]

USER
<state>[]</state>
<prompt>Create a line from (-2, 2) to (2, -2)</prompt>

GPT
[
  "\\token{1}=\\left(-2,2\\right)",
  "\\token{2}=\\left(2,-2\\right)",
  "\\token{3}=\\operatorname{segment}\\left(\\token{1},\\token{2}\\right)"
]

USER
<state>[
  "\token{1}=\left(-2,2\right)",
  "\token{2}=\left(2,-2\right)",
  "\token{3}=\operatorname{segment}\left(\token{1},\token{2}\right)"
]</state>
<prompt>Now add a third point anywhere along the x axis, add a line between it and (2, -2), and add an angle that the two segments make.</prompt>

GPT
[
"\\token{1}=\\left(-2,2\\right)",
"\\token{2}=\\left(2,-2\\right)",
"\\token{3}=\\operatorname{segment}\\left(\\token{1},\\token{2}\\right)",
"\\token{4}=\\left(1,0\\right)",
"\\token{5}=\\operatorname{segment}\\left(\\token{4},\\token{2}\\right)",
"\\token{6}=\\operatorname{angle}\\left(\\token{1},\\token{2},\\token{4}\\right)"
]