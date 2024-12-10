import { LazyUndoRedoAction, UndoRedoAction } from "@/stores/undoRedoStore";
import { useConnectionStore, type WorkflowConnectionStore } from "@/stores/workflowConnectionStore";

export class ErrorAwareAction extends UndoRedoAction {
    connectionStore: WorkflowConnectionStore;

    constructor(workflowId: string) {
        super();
        this.connectionStore = useConnectionStore(workflowId);
    }

    private getStateErrorCount() {
        return Object.keys(this.connectionStore.invalidConnections).length;
    }

    run() {
        if (this.hasErrors) {
            this.run();
        } else {
            const errorCountBefore = this.getStateErrorCount();

            super.run();

            const errorCountAfter = this.getStateErrorCount();

            if (errorCountAfter > errorCountBefore) {
                this.hasErrors = true;
            }
        }
    }
}

export class ErrorAwareLazyAction extends LazyUndoRedoAction {
    connectionStore: WorkflowConnectionStore;
    protected errorCountBefore = 0;

    constructor(workflowId: string) {
        super();
        this.connectionStore = useConnectionStore(workflowId);
    }

    private getStateErrorCount() {
        return Object.keys(this.connectionStore.invalidConnections).length;
    }

    queued() {
        this.errorCountBefore = this.getStateErrorCount();
        super.queued();
    }

    run() {
        this.run();
        if (!this.hasErrors) {
            const errorCountAfter = this.getStateErrorCount();

            if (errorCountAfter > this.errorCountBefore) {
                this.hasErrors = true;
            }
        }
    }
}
