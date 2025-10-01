import { VueRenderer } from '@tiptap/vue-3';
import { computePosition, flip, shift } from '@floating-ui/dom'

import MentionList from './MentionList.vue';

const updatePosition = (editor, element) => {
  const virtualElement = {
    getBoundingClientRect: () => posToDOMRect(editor.view, editor.state.selection.from, editor.state.selection.to),
  }

  computePosition(virtualElement, element, {
    placement: 'bottom-start',
    strategy: 'absolute',
    middleware: [shift(), flip()],
  }).then(({ x, y, strategy }) => {
    element.style.width = 'max-content'
    element.style.position = strategy
    element.style.left = `${x}px`
    element.style.top = `${y}px`
  })
}

export default {
    render: () => {
        let component

        return {
            onStart: props => {
                component = new VueRenderer(MentionList, {
                    props,
                    editor: props.editor,
                });

                if (!props.clientRect) {
                    return;
                }

                component.element.style.position = 'absolute'

                wwLib.getFrontDocument().body.appendChild(component.element)

                updatePosition(props.editor, component.element)
            },

            onUpdate(props) {
                component.updateProps(props);

                if (!props.clientRect) {
                    return;
                }

                updatePosition(props.editor, component.element)
            },

            onKeyDown(props) {
                if (props.event.key === 'Escape') {
                    component.destroy()

                    return true;
                }

                return component.ref && component.ref.onKeyDown(props);
            },

            onExit() {
                component.element.remove()
                component.destroy()
            },
        };
    },
};
