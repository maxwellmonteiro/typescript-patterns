
interface Car extends BaseRecord {   
    hp: number;
    torque: number;
}

interface BaseRecord {
    id: string;
}

interface Database<T extends BaseRecord> {
    save(value: T): void;
    load(id: string): T;
}

interface Publisher<T extends BaseRecord> {    
    subscribe(observer: (item: T) => void): () => void;
    publish(state: T): void;
}

class PublisherImpl<T extends BaseRecord> implements Publisher<T> {
    private observers: ((item: T) => void)[] = [];

    // subscribe the observer and return unsubscribe function
    subscribe(observer: (item: T) => void): () => void {
        this.observers.push(observer);
        return () => {
            // unsubscribe this observer
            this.observers = this.observers.filter(o => o !== observer);
        }
    }

    publish(state: T) {
        this.observers.forEach(f => f(state));
    }
}

// Factory
function createInMemory<T extends BaseRecord>() {
    class InMemoryDB implements Database<T> {

        private db: Record<string, T> = {};

        private onSavePublisher: Publisher<T> = new PublisherImpl<T>();
        private onLoadPublisher: Publisher<T> = new PublisherImpl<T>();

        public save(value: T) {
            this.onSavePublisher.publish(value);
            this.db[value.id] = value;            
        }

        public load(id: string): T {
            this.onLoadPublisher.publish(this.db[id]);
            return this.db[id];            
        }   

        // Visitor
        public visit(visitor: (item: T) => void) {
            Object.entries(this.db).forEach(item => {
                visitor(item[1]);
            });            
        }

        // Observer
        public onSave(): Publisher<T> {
            return this.onSavePublisher;
        }

        public onLoad(): Publisher<T> {
            return this.onLoadPublisher;
        }        
    }
    const instance = new InMemoryDB();
    return instance;
}

const carsDb = createInMemory<Car>();
// Observers
const unsubscribeObs1 = carsDb.onSave().subscribe(car => {
    console.log(`Observer 1 saving... ${car.id}`);
});
const unsubscribeObs2 = carsDb.onSave().subscribe(car => {
    console.log(`Observer 2 saving... ${car.id}`);
});
carsDb.onLoad().subscribe(car => {
    console.log(`Observer 3 loading... ${car.id}`);
});
carsDb.save({ id: 'bmw 130i', hp: 265, torque: 32 });
carsDb.save({ id: 'mini cooper s', hp: 191, torque: 28 });
unsubscribeObs1();
carsDb.save({ id: 'porsche cayman s', hp: 315, torque: 37});
// Visitor
const visitor = (car: Car) => { 
    console.log(`visiting... ${car.id}`) ;
};
carsDb.visit(visitor);

carsDb.load('bmw 130i');
