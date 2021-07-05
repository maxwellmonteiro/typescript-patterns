
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

// Factory
function createInMemory<T extends BaseRecord>() {
    class InMemoryDB implements Database<T> {

        private db: Record<string, T> = {};               

        public save(value: T) {
            this.db[value.id] = value;
        }

        public load(id: string): T {
            return this.db[id];
        }   

        public visit(visitor: (item: T) => void) {
            Object.entries(this.db).forEach(item => {
                visitor(item[1]);
            });
        }
        
    }
    const instance = new InMemoryDB();
    return instance;
}

const carsDb = createInMemory<Car>();

carsDb.save({ id: 'bmw 130i', hp: 265, torque: 32 });
carsDb.save({ id: 'mini cooper s', hp: 191, torque: 28 });
carsDb.save({ id: 'porsche cayman s', hp: 315, torque: 37});
// Visitor
const visitor = (item: Car) => { console.log(item) };
carsDb.visit(visitor);
